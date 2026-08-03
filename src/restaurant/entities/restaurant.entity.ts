import { User } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MenuItem } from './menu-items.entity';
import { Category } from './category.entity';

export enum CuisineType {
  NIGERIAN = 'nigerian',
  CHINESE = 'chinese',
  ITALIAN = 'italian',
  AMERICAN = 'american',
  INDIAN = 'indian',
  CONTINENTAL = 'continental',
  FAST_FOOD = 'fast_food',
  OTHER = 'other',
}

@Entity('restaurant')
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'enum', enum: CuisineType, default: CuisineType.OTHER })
  cuisineType: CuisineType;

  @Column()
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ nullable: true, length: 20 })
  phone: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: true })
  isOpen: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 5.0 })
  deliveryRadiusKm: number;

  @Column({ type: 'int', default: 0 })
  minimumOrderAmount: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ name: 'total-ratings', default: 0 })
  totalRating: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  owner: User;

  @Column()
  ownerId: string;

  @OneToMany(() => MenuItem, (item) => item.restaurant)
  menuItems: MenuItem[];

  @OneToMany(() => Category, (category) => category.restaurant)
  categories: Category[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
