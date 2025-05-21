import { hashPassword } from 'src/shared/helpers/transform-password.helper';
import { generateRandomString } from 'src/shared/helpers/generate-random-string.helper';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @Column({
    nullable: false,
    transformer: {
      to(n: string) {
        return n?.trim()?.toUpperCase();
      },
      from(n: string) {
        return n?.trim()?.toUpperCase();
      },
    },
  })
  name: string;

  @Column({
    nullable: false,
    unique: true,
    transformer: {
      to(n: string) {
        return n?.trim()?.toLowerCase();
      },
      from(n: string) {
        return n?.trim()?.toLowerCase();
      },
    },
  })
  email: string;

  @Column({
    nullable: false,
    select: false,
  })
  password: string;

  @Column({
    nullable: false,
    unique: true,
  })
  api_key: string;

  @Column({
    nullable: false,
    unique: true,
  })
  api_secret: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async function() {
    if (this.password) {
      this.password = await hashPassword(this.password);
    }
  }

  @BeforeInsert()
  async function2() {
    this.api_key = generateRandomString({
      length: 32,
      includeLowercase: true,
      includeNumbers: true,
      includeUppercase: true,
      includeSymbols: false,
    });

    this.api_secret = generateRandomString({
      length: 32,
      includeLowercase: true,
      includeNumbers: true,
      includeUppercase: true,
      includeSymbols: false,
    });
  }
}
