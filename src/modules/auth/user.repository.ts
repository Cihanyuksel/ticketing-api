import { AppDataSource } from "../../config/db";
import { RegisterDTO } from "./auth.dto";
import { User } from "./user.entity";
import { IUserRepository } from "./user.repository.interface";

export class TypeOrmUserRepository implements IUserRepository {
  private repo = AppDataSource.getRepository(User);

  async create(data: RegisterDTO): Promise<User> {
    const newUser = this.repo.create(data);
    return await this.repo.save(newUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOneBy({ email });
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOneBy({ id });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.repo.findOne({
      where: { email },
      select: [
        "id",
        "email",
        "password",
        "role",
        "firstName",
        "lastName",
        "isActive",
      ],
    });
  }
}
