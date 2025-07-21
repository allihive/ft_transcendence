import { Entity, PrimaryKey, Property, ManyToOne, Unique, OneToMany } from "@mikro-orm/core";
import { User } from "../../user/entities/user.entity";
import { v4 } from 'uuid';

@Entity()
@Unique({ properties: ['requester', 'addressee'] })
export class FriendRequest {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @ManyToOne(() => User)
  requester!: User;

  @ManyToOne(() => User)
  addressee!: User;

  @Property()
  status: 'pending' | 'accepted' | 'rejected' = 'pending';

  @Property()
  createdAt: Date = new Date();

  @Property({ nullable: true })
  acceptedAt?: Date;
}
  

//user<->user middle table
  @Entity()
  export class Friendship {
    @PrimaryKey({ type: 'uuid' })
    id!: string;

    @ManyToOne(() => User)
    user!: User;

    @ManyToOne(() => User)
    friend!: User;

    @Property()
    status: 'active' | 'blocked' = 'active';
    
    @Property({ type: 'timestamptz'})
    createdAt?: Date;
  }