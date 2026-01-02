import { Entity, Column, BeforeInsert } from "typeorm";
import * as bcrypt from "bcrypt";
import { BaseEntity } from "../common/BaseEntity"; 

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
  PREFER_NOT_TO_SAY = "NOT_SPECIFIED",
}

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

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ unique: true, nullable: true })
  phone!: string;

  @Column({ type: "enum", enum: Gender, default: Gender.PREFER_NOT_TO_SAY })
  gender!: Gender;

  @Column({ type: "date", nullable: true })
  dateOfBirth!: Date;

  @Column({ nullable: true })
  city!: string;

  @Column({ nullable: true })
  country!: string;

  @Column({ type: "enum", enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Column({ default: true })
  isActive!: boolean;

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
