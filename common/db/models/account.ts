import 'reflect-metadata';
import { Column, Entity, UpdateDateColumn, CreateDateColumn } from 'typeorm';

@Entity({ name: 'account' })
export class AccountModel {
  @Column('text', {
    nullable: false,
    primary: true,
    name: 'handle'
  })
  public handle: string;

  @Column('text')
  public firstName: string;

  @Column('text')
  public lastName: string;

  @Column('text', { unique: true })
  public email: string;

  @Column('timestamptz', { default: () => 'CURRENT_TIMESTAMP' })
  public cachedDate: Date;

  @Column('boolean')
  public accountClosed: boolean;

  @CreateDateColumn({ type: 'timestamptz', readonly: true, name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', readonly: true, name: 'updated_at' })
  public updatedAt: Date;
}
