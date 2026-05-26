import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Driver } from './driver.entity';

@Entity('driver-location')
export class DriverLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Driver, { onDelete: 'CASCADE' })
  @JoinColumn()
  driver: Driver;

  @Column()
  driverId: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ type: 'decimal', nullable: true })
  heading: number;

  @UpdateDateColumn()
  updatedAt?: Date;
}
