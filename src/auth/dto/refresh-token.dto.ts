import { IsString } from 'class-validator'

export class RefreshTokenDto {
	@IsString({
		message: 'Refresh token must be a string',
	})
	refreshToken: string
}
