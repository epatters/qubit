import { type RpcResponse, create_payload } from "./jsonrpc";
import { wrap_promise } from "./proxy";
import type { StreamSubscriber } from "./stream";

export type Client = {
  request: (id: string | number, payload: any) => Promise<RpcResponse<any>>;
  subscribe?: (id: string | number, on_data?: (value: any) => void, on_end?: () => void) => () => void;
};

export function build_client<Server>(client: Client): Server {
  let next_id = 0;

  return new Proxy(
    {},
    {
      get: (_, prop) => {
        const method = [prop];

        return new Proxy(() => {}, {
          get: (_target, prop, client) => {
            method.push(prop);

            return client;
          },
          apply: (_target, _this, args) => {
            const id = next_id++;

            // biome-ignore lint/suspicious/noAsyncPromiseExecutor: TODO: check this is correct
            const p = new Promise(async (resolve, reject) => {
              const payload = create_payload(id, method.join("."), args);
              const response = await client.request(id, payload);

              if (response.type === "ok") {
                resolve(response.value);
              } else {
                reject(response);
              }
            });

            const subscribe: StreamSubscriber<any> = (handler) => {
              let on_data = (_: unknown) => {};
              let on_error = (_: Error) => {};
              let on_end = () => {};

              if (typeof handler === "function") {
                on_data = handler;
              } else {
                if (handler?.on_data) {
                  on_data = handler.on_data;
                }
                if (handler?.on_error) {
                  on_error = handler.on_error;
                }
                if (handler?.on_end) {
                  on_end = handler.on_end;
                }
              }

              // Make sure the client can handle susbcriptions
              if (!client.subscribe) {
                on_error(new Error("client does not support subscriptions"));
                return () => {};
              }
              const subscribe = client.subscribe;

              // Hoist the unsubscribe function, which is asyncronousely returned
              // biome-ignore lint/style/useConst: biome fails to recognise reassignment?
              let unsubscribe_inner: Promise<() => void>;

              // Helper unsubscribe function, which will wait for the internal unsubscribe
              // function to be populated before calling it.
              const unsubscribe = async () => {
                (await unsubscribe_inner)();
              };

              // Populate inner unsubscribe with the asynchronous subscription
              unsubscribe_inner = (async () => {
                // Get the response of the request
                const subscription_id = await p;

                let count = 0;
                let required_count: number | null = null;

                // Result should be a subscription ID
                if (typeof subscription_id !== "string" && typeof subscription_id !== "number") {
                  // TODO: Throw an error
                  on_error(new Error("cannot subscribe to subscription"));
                  return () => {};
                }

                // Subscribe to incomming requests
                return subscribe(
                  subscription_id,
                  (data) => {
                    if (typeof data === "object" && "close_stream" in data && data.close_stream === subscription_id) {
                      required_count = data.count;
                    } else if (on_data) {
                      count += 1;
                      on_data(data);
                    }

                    if (count === required_count) {
                      // The expected amount of messages have been recieved, so it is safe to terminate the connection
                      unsubscribe();
                    }
                  },
                  on_end,
                );
              })();

              return unsubscribe;
            };

            return wrap_promise(p, { subscribe });
          },
        });
      },
    },
  ) as unknown as Server;
}
