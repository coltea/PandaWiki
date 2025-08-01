/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export enum DomainLicenseEdition {
  LicenseEditionFree = 0,
  LicenseEditionContributor = 1,
  LicenseEditionEnterprise = 2,
}

export enum DomainCommentStatus {
  CommentStatusReject = -1,
  CommentStatusPending = 0,
  CommentStatusAccepted = 1,
}

export enum ConstsSourceType {
  SourceTypeDingTalk = "dingtalk",
}

export interface DomainCommentModerateListReq {
  ids: string[];
  status: DomainCommentStatus;
}

export interface DomainDeleteDocumentFeedbackReq {
  /** @minItems 1 */
  ids: string[];
}

export interface DomainDocumentFeedbackInfo {
  /** ip */
  remote_ip?: string;
  screen_shot?: string;
}

export interface DomainDocumentFeedbackListItem {
  content?: string;
  correction_suggestion?: string;
  created_at?: string;
  id?: string;
  info?: DomainDocumentFeedbackInfo;
  ip_address?: DomainIPAddress;
  kb_id?: string;
  node_id?: string;
  node_name?: string;
  user_id?: string;
}

export interface DomainIPAddress {
  city?: string;
  country?: string;
  ip?: string;
  province?: string;
}

export interface DomainLicenseResp {
  edition?: DomainLicenseEdition;
  expired_at?: number;
  started_at?: number;
  state?: number;
}

export interface DomainResponse {
  data?: unknown;
  message?: string;
  success?: boolean;
}

export interface GithubComChaitinPandaWikiProApiAuthV1AuthItem {
  created_at?: string;
  id?: number;
  ip?: string;
  last_login_time?: string;
  source_type?: ConstsSourceType;
  username?: string;
}

export interface GithubComChaitinPandaWikiProApiAuthV1GetAuthResp {
  auths?: GithubComChaitinPandaWikiProApiAuthV1AuthItem[];
  client_id?: string;
  client_secret?: string;
  source_type?: ConstsSourceType;
}

export interface GithubComChaitinPandaWikiProApiAuthV1SetAuthReq {
  clientID?: string;
  clientSecret?: string;
  kb_id?: string;
  sourceType?: ConstsSourceType;
}

export interface GithubComChaitinPandaWikiProApiShareV1AuthDingTalkReq {
  kb_id?: string;
  redirect_url?: string;
}

export interface GithubComChaitinPandaWikiProApiShareV1AuthDingTalkResp {
  url?: string;
}

export type GithubComChaitinPandaWikiProApiShareV1DingtalkCallbackResp = Record<
  string,
  any
>;

export interface HandlerV1DocFeedBackLists {
  data?: DomainDocumentFeedbackListItem[];
  total?: number;
}

export interface GetApiProV1AuthGetParams {
  kb_id?: string;
  source_type?: "dingtalk";
}

export interface GetApiProV1DocumentListParams {
  kb_id: string;
  /** @min 1 */
  page: number;
  /** @min 1 */
  per_page: number;
}

export interface PostApiV1LicensePayload {
  /** license type */
  license_type: "file" | "code";
  /**
   * license file
   * @format binary
   */
  license_file: File;
  /** license code */
  license_code: string;
}

export interface PostShareProV1DocumentFeedbackPayload {
  /** Node ID */
  node_id: string;
  /** Content */
  content: string;
  /** Correction Suggestion */
  correction_suggestion?: string;
  /**
   * Screenshot
   * @format binary
   */
  image?: File;
}

export interface GetShareProV1OpenapiDingtalkCallbackParams {
  code?: string;
  state?: string;
}
