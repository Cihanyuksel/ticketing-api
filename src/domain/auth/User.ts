import { Entity, Column, BeforeInsert } from "typeorm";
import * as bcrypt from "bcrypt"; 
import { BaseEntity } from "../common/BaseEntity";

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

@Entity("users")

export class User extends BaseEntity {
  @Column({ unique: true }) 
  email!: string;

  @Column({ select: false })
  password!: string;

  @Column({ type: "enum", enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Column({ nullable: true })
  firstName!: string;

  @Column({ nullable: true })
  lastName!: string;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}
