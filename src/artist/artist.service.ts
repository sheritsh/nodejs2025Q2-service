import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../database/database.service';
import { Artist } from '../interfaces/artist.interface';
import { CreateArtistDto, UpdateArtistDto } from '../dto/artist.dto';

@Injectable()
export class ArtistService {
  constructor(private readonly databaseService: DatabaseService) {}

  findAll(): Artist[] {
    return this.databaseService.getArtists();
  }

  findOne(id: string): Artist {
    const artist = this.databaseService.getArtistById(id);
    if (!artist) {
      throw new NotFoundException('Artist not found');
    }
    return artist;
  }

  create(createArtistDto: CreateArtistDto): Artist {
    const artist: Artist = {
      id: randomUUID(),
      name: createArtistDto.name,
      grammy: createArtistDto.grammy,
    };

    return this.databaseService.addArtist(artist);
  }

  update(id: string, updateArtistDto: UpdateArtistDto): Artist {
    const artist = this.databaseService.getArtistById(id);
    if (!artist) {
      throw new NotFoundException('Artist not found');
    }

    const updatedArtist = this.databaseService.updateArtist(
      id,
      updateArtistDto,
    );
    return updatedArtist!;
  }

  remove(id: string): void {
    const artist = this.databaseService.getArtistById(id);
    if (!artist) {
      throw new NotFoundException('Artist not found');
    }

    this.databaseService.deleteArtist(id);
  }
}
