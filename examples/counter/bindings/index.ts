import type { Mutation } from "@qubit-rs/client";import type { Query } from "@qubit-rs/client";import type { Subscription } from "@qubit-rs/client";import type { StreamHandler } from "@qubit-rs/client";import type { StreamUnsubscribe } from "@qubit-rs/client";
export type QubitServer = { increment: Mutation<() => Promise<null>>, decrement: Mutation<() => Promise<null>>, add: Mutation<(n: number, ) => Promise<null>>, get: Query<() => Promise<number>>, countdown: Subscription<( handler: StreamHandler<number>) => StreamUnsubscribe> };