import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { generateSlug } from 'src/utils/generate-slug'
import { UpdateActorDto } from './dto/update-actor.dto'
import {
	returnActorObject,
	returnDeleteActorObject,
	returnErrorSlugActorObject,
} from './return-actor.object'

@Injectable()
export class ActorService {
	constructor(private prisma: PrismaService) {}

	async getAll(searchTerm?: string) {
		if (searchTerm) return this.search(searchTerm)

		return this.prisma.actor.findMany({
			select: returnActorObject,
			orderBy: {
				createdAt: 'desc',
			},
		})
	}

	private async search(searchTerm: string) {
		return this.prisma.actor.findMany({
			where: {
				OR: [
					{
						name: {
							contains: searchTerm,
							mode: 'insensitive',
						},
					},
				],
			},
		})
	}

	async getBySlug(slug: string) {
		const actor = await this.prisma.actor.findUnique({
			where: {
				slug,
			},
			select: returnActorObject,
		})

		if (!actor) throw new NotFoundException('Actor not found')

		return actor
	}

	/* Queries for admin */

	async getById(id: string) {
		const actor = await this.prisma.actor.findUnique({
			where: {
				id,
			},
			select: returnActorObject,
		})

		if (!actor) throw new NotFoundException('Actor not found')

		return actor
	}

	async create() {
		const actorSlug = await this.prisma.actor.findUnique({
			where: {
				slug: '',
			},
			select: returnErrorSlugActorObject,
		})

		if (actorSlug) {
			throw new NotFoundException({
				message: 'There is an empty slug, update the actor by ID',
				actor: actorSlug,
			})
		}

		const actor = await this.prisma.actor.create({
			data: {
				name: '',
				slug: '',
				photoUrl: '',
			},
		})

		return actor.id
	}

	async update(id: string, dto: UpdateActorDto) {
		return this.prisma.actor.update({
			where: {
				id,
			},
			data: {
				name: dto.name,
				slug: generateSlug(dto.name),
				photoUrl: dto.photoUrl,
			},
		})
	}

	async delete(id: string) {
		return this.prisma.actor.delete({
			where: {
				id,
			},
			select: returnDeleteActorObject,
		})
	}
}
