import { UserRole } from '@prisma/client'
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator'

export class UpdateUserDto {
	@IsString()
	name: string

	@IsEmail()
	email: string

	@MinLength(6, {
		message: 'Password must be at least 6 characters',
	})
	@IsString()
	password: string

	@IsEnum(UserRole)
	role: UserRole
}
