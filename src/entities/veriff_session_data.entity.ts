import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
} from 'typeorm';
import { VeriffSessionDocument } from 'src/shared/interfaces';
import { VeriffSession } from './veriff_sessions.entity';

@Entity('veriff_session_data')
export class VeriffSessionData {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @Column({
    nullable: true,
    transformer: {
      to(n: string) {
        return n?.trim()?.toUpperCase();
      },
      from(n: string) {
        return n?.trim()?.toUpperCase();
      },
    },
  })
  id_type?: string;

  @Column({
    nullable: true,
    transformer: {
      to(n: string) {
        return n?.trim()?.toUpperCase();
      },
      from(n: string) {
        return n?.trim()?.toUpperCase();
      },
    },
  })
  id_number?: string;

  @Column({
    nullable: true,
    transformer: {
      to(n: string) {
        return n?.trim()?.toUpperCase();
      },
      from(n: string) {
        return n?.trim()?.toUpperCase();
      },
    },
  })
  date_of_birth?: string;

  @Column({
    nullable: true,
    transformer: {
      to(n: string) {
        return n?.trim()?.toUpperCase();
      },
      from(n: string) {
        return n?.trim()?.toUpperCase();
      },
    },
  })
  person_name?: string;

  @Column({
    nullable: true,
    transformer: {
      to(n: string) {
        return n?.trim()?.toUpperCase();
      },
      from(n: string) {
        return n?.trim()?.toUpperCase();
      },
    },
  })
  address?: string;

  @Column({
    nullable: true,
    transformer: {
      to(n: string) {
        return n?.trim()?.toUpperCase();
      },
      from(n: string) {
        return n?.trim()?.toUpperCase();
      },
    },
  })
  document_country?: string;

  @Column({
    nullable: true,
    transformer: {
      to(n: string) {
        return n?.trim()?.toUpperCase();
      },
      from(n: string) {
        return n?.trim()?.toUpperCase();
      },
    },
  })
  issued_date?: string;

  @Column({
    nullable: true,
    transformer: {
      to(n: string) {
        return n?.trim()?.toUpperCase();
      },
      from(n: string) {
        return n?.trim()?.toUpperCase();
      },
    },
  })
  expiry_date?: string;

  @Column({ type: 'jsonb', default: [] })
  documents: VeriffSessionDocument[];

  @OneToOne(() => VeriffSession, (v) => v?.session_data)
  session?: VeriffSession;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
