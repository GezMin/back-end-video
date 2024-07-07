import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class UserService {
	constructor(private readonly prisma: PrismaService) {}

	async getById(id: string) {
		return await this.prisma.user.findUnique({
			where: { id },
			include: { favorites: true },
		})
	}

	async getByEmail(email: string) {
		return await this.prisma.user.findUnique({
			where: { email },
			include: { favorites: true },
		})
	}
}
