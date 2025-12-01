import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common'
import { UserService } from 'src/user/user.service'
import { AuthDto } from './dto/auth.dto'
import { JwtService } from '@nestjs/jwt'
import { verify } from 'argon2'

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwt: JwtService,
	) {}

	async register(dto: AuthDto) {
		const checkUser = await this.userService.getByEmail(dto.email)

		if (checkUser) {
			throw new BadRequestException('User already exists')
		}

		const user = await this.userService.create(dto)

		const tokens = this.issueToken(user.id)

		return { user, ...tokens }
	}

	async login(dto: AuthDto) {
		const user = await this.validateUser(dto)

		const tokens = this.issueToken(user.id)

		return { user, ...tokens }
	}

	async getNewTokens(refreshToken: string) {
		const result = await this.jwt.verify(refreshToken)

		if (!result) {
			throw new UnauthorizedException('Invalid token')
		}
		const user = await this.userService.getById(result.id)

		const tokens = this.issueToken(user.id)

		return { user, ...tokens }
	}

	private issueToken(userId: string) {
		const data = { id: userId }

		const accessToken = this.jwt.sign(data, {
			expiresIn: '1h',
		})

		const refreshToken = this.jwt.sign(data, {
			expiresIn: '7d',
		})

		return {
			accessToken,
			refreshToken,
		}
	}

	private async validateUser(dto: AuthDto) {
		const user = await this.userService.getByEmail(dto.email)

		if (!user) {
			throw new NotFoundException('User not found')
		}

		const isValidPassword = await verify(user.password, dto.password)

		if (!isValidPassword) {
			throw new UnauthorizedException('Invalid password')
		}

		return user
	}
}
