/* eslint-disable */
// @ts-nocheck
/*    @@@@@@@@@@@@@ & ###############
   @@@@@@@@@@@@@@ &&& ###############
 @@@@@@@@@@@@@@ &&&&& ###############
############### &&&&& ###############
######## Generated by Qubit! ########
############### &&&&& ###############
############### &&&&& @@@@@@@@@@@@@@
############### && @@@@@@@@@@@@@@
############### & @@@@@@@@@@@@@    */

import type { Query } from "@qubit-rs/client";
import type { Mutation } from "@qubit-rs/client";
import type { Subscription } from "@qubit-rs/client";
import type { ChatMessage } from "./ChatMessage.ts";

export type QubitServer = { get_name: Query<[], string>, send_message: Mutation<[message: string, ], null>, list_online: Subscription<[], Array<string>>, list_messages: Subscription<[], Array<ChatMessage>> };