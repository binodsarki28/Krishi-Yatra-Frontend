// ============================================================
// IAccount.ts — Interfaces matching the KrishiYatra backend DTOs
// Base URL: api/v1/user
// ============================================================

// ────────────────────────────────────────────────────────────
// ENUMS
// ────────────────────────────────────────────────────────────

/** Matches: com.krishiYatra.krishiYatra.common.enums.RoleType */
export enum RoleType {
    USER = 'USER',
    FARMER = 'FARMER',
    BUYER = 'BUYER',
    DELIVERY = 'DELIVERY',
    ADMIN = 'ADMIN'
}

// ────────────────────────────────────────────────────────────
// REQUEST DTOs
// ────────────────────────────────────────────────────────────

/**
 * Matches: UserCreateRequest.java
 * Endpoint: POST /api/v1/user/register
 *
 * Validations (from backend):
 *  - fullName: required, 5–20 chars, pattern: "First Last" (capitalized words)
 *  - username: required
 *  - email: required, valid email format
 *  - password: required, min 8 chars, must have uppercase, lowercase, digit, special char
 *  - phoneNumber: required, exactly 10 digits, starts with 98/97/96/95/94 (Nepal numbers)
 */
export interface IUserCreateRequest {
    fullName: string;
    username: string;
    email: string;
    password: string;
    phoneNumber: string;
}

/**
 * Matches: UserLoginRequest.java
 * Endpoint: POST /api/v1/user/login
 *
 * Validations:
 *  - username: required
 *  - password: required
 */
export interface IUserLoginRequest {
    username: string;
    password: string;
}

/**
 * Matches: OtpRequestDto.java
 * Endpoint: POST /api/v1/user/resend-otp
 *
 * Validations:
 *  - email: required, valid email format
 */
export interface IOtpRequest {
    email: string;
}

/**
 * Matches: OtpVerifyDto.java
 * Endpoint: POST /api/v1/user/verify-otp
 *
 * Validations:
 *  - email: required, valid email format
 *  - otpCode: required, exactly 6 digits
 */
export interface IOtpVerify {
    email: string;
    otpCode: string;
}

/**
 * Matches: OtpVerifyAndRegisterDto.java
 * Endpoint: POST /api/v1/user/register (OTP flow variant)
 *
 * Validations:
 *  - email: required, valid email
 *  - otpCode: required, exactly 6 digits
 *  - fullName: required
 *  - username: required
 *  - password: required, strong password pattern
 *  - phoneNumber: optional in this DTO (no @NotNull in backend)
 */
export interface IOtpVerifyAndRegister {
    email: string;
    otpCode: string;
    fullName: string;
    username: string;
    password: string;
    phoneNumber?: string;
}

export interface IPasswordUpdate {
    currentPassword?: string;
    newPassword?: string;
}

// ────────────────────────────────────────────────────────────
// RESPONSE DTOs
// ────────────────────────────────────────────────────────────

/**
 * Matches: JwtResponse.java
 * Returned inside ServerResponse.response after successful login
 *
 * Fields:
 *  - token: JWT access token
 *  - type: always "Bearer"
 *  - username: logged-in user's username
 *  - roles: list of role strings e.g. ["FARMER"]
 */
export interface IJwtResponse {
    token: string;
    type: string;
    username: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    profileUrl?: string;
    description?: string;
    roles: RoleType[];
    verifiedRoles: RoleType[];
    statusMessages?: { [key: string]: string };
}

/**
 * Matches: ServerResponse.java
 * Wrapper around every API response from the backend.
 *
 * Fields:
 *  - message: human-readable status message
 *  - fieldName: field that caused error (validation errors)
 *  - statusCode: HTTP status code (e.g. 200, 400, 401)
 *  - response: actual data payload (e.g. IJwtResponse on login)
 *  - totalItems: used for paginated list responses
 */
export interface IServerResponse<T = unknown> {
    message: string;
    fieldName?: string;
    statusCode: number;
    response?: T;
    totalItems?: number;
}

// ────────────────────────────────────────────────────────────
// CONVENIENCE TYPES
// ────────────────────────────────────────────────────────────

/** Server response specifically for login — response field is IJwtResponse */
export type ILoginResponse = IServerResponse<IJwtResponse>;

/** Server response for register / OTP operations — response field is a message string */
export type IRegisterResponse = IServerResponse<string>;
