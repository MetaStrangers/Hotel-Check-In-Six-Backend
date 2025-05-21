import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { VeriffSessionDocument } from 'src/shared/interfaces';
import { VeriffSessionUserDocumentIdTypes } from 'src/shared/enum';

@Entity('veriff_session_data')
export class VeriffSessionData {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @Column({ nullable: false, type: 'integer' })
  document_id_type: VeriffSessionUserDocumentIdTypes;

  @Column({ type: 'jsonb', default: [] })
  documents: VeriffSessionDocument[];

  @Column({ type: 'jsonb', default: {} })
  extracted_data: object;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
