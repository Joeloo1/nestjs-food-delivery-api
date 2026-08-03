import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MenuItem } from './menu-items.entity';
import { Restaurant } from './restaurant.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 0 })
  sortOrder: number;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.categories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  restaurant: Restaurant;

  @Column()
  restaurantId: string;

  @OneToMany(() => MenuItem, (item) => item.category)
  menuItems: MenuItem[];
}
