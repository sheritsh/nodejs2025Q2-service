import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../database/database.service';
import { Album } from '../interfaces/album.interface';
import { CreateAlbumDto, UpdateAlbumDto } from '../dto/album.dto';

@Injectable()
export class AlbumService {
  constructor(private readonly databaseService: DatabaseService) {}

  findAll(): Album[] {
    return this.databaseService.getAlbums();
  }

  findOne(id: string): Album {
    const album = this.databaseService.getAlbumById(id);
    if (!album) {
      throw new NotFoundException('Album not found');
    }
    return album;
  }

  create(createAlbumDto: CreateAlbumDto): Album {
    const album: Album = {
      id: randomUUID(),
      name: createAlbumDto.name,
      year: createAlbumDto.year,
      artistId: createAlbumDto.artistId,
    };

    return this.databaseService.addAlbum(album);
  }

  update(id: string, updateAlbumDto: UpdateAlbumDto): Album {
    const album = this.databaseService.getAlbumById(id);
    if (!album) {
      throw new NotFoundException('Album not found');
    }

    const updatedAlbum = this.databaseService.updateAlbum(id, updateAlbumDto);
    return updatedAlbum!;
  }

  remove(id: string): void {
    const album = this.databaseService.getAlbumById(id);
    if (!album) {
      throw new NotFoundException('Album not found');
    }

    this.databaseService.deleteAlbum(id);
  }
}
