import { UserEntity } from './user-entity.model';

export type PartialUserEntity = Omit<UserEntity, 'password' | 'is_admin'>;
