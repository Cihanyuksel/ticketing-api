import { User } from "./user.entity";
import { RegisterDTO } from "./auth.dto";

export interface IUserRepository {
  create(data: RegisterDTO): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByEmailWithPassword(email: string): Promise<User | null>;
}
