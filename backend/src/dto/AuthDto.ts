export interface LocalRegisterDto {
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}
