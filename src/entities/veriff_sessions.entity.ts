import { VeriffSessionStatus } from 'src/shared/enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Company, VeriffSessionData } from '.';

@Entity('veriff_sessions')
export class VeriffSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    default: VeriffSessionStatus.STARTED,
    type: 'int',
  })
  status: VeriffSessionStatus;

  @OneToOne(() => VeriffSessionData)
  @JoinColumn({ name: 'session_data_id' })
  session_data?: VeriffSessionData;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
