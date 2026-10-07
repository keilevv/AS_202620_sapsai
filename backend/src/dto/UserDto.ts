export interface UpdateUserDto {
  fullName?: string;
  email?: string;
  phone?: string;
  institution?: string;
  department?: string;
  location?: string;
  bio?: string;
  password?: string;
  emailNotifications?: boolean;
  requestedContributorStatus?: boolean;
}
