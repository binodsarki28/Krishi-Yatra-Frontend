
export enum RoleType {
    USER = 'USER',
    FARMER = 'FARMER',
    BUYER = 'BUYER',
    DELIVERY = 'DELIVERY',
    ADMIN = 'ADMIN'
}

/**
 * Matches: UserCreateRequest.java
 * Endpoint: POST /api/v1/user/register
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
 */
export interface IUserLoginRequest {
    username: string;
    password: string;
}

/**
 * Matches: OtpRequestDto.java
 * Endpoint: POST /api/v1/user/resend-otp
 */
export interface IOtpRequest {
    email: string;
}

/**
 * Matches: OtpVerifyDto.java
 * Endpoint: POST /api/v1/user/verify-otp
 */
export interface IOtpVerify {
    email: string;
    otpCode: string;
}

/**
 * Matches: OtpVerifyAndRegisterDto.java
 * Endpoint: POST /api/v1/user/register (OTP flow variant)
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

export interface IResetPassword {
    email: string;
    otpCode: string;
    newPassword: string;
}

/**
 * Matches: JwtResponse.java
 * Returned inside ServerResponse.response after successful login
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
