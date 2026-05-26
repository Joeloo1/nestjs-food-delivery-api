import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum VehicleType {
  BICYCLE = 'bicycle',
  MOTORCYCLE = 'motorcycle',
  CAR = 'car',
}

@Entity()
export class Driver {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: VehicleType, default: VehicleType.MOTORCYCLE })
  vehicleType: VehicleType;

  @Column({ nullable: true })
  LicencePlate: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @CreateDateColumn()
  createdAt?: Date;
}
