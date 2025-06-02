import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { FavoritesResponse } from '../interfaces/favorites.interface';

@Injectable()
export class FavoritesService {
  constructor(private readonly databaseService: DatabaseService) {}

  findAll(): FavoritesResponse {
    const favorites = this.databaseService.getFavorites();

    const artists = favorites.artists
      .map((id) => this.databaseService.getArtistById(id))
      .filter((artist) => artist !== undefined);

    const albums = favorites.albums
      .map((id) => this.databaseService.getAlbumById(id))
      .filter((album) => album !== undefined);

    const tracks = favorites.tracks
      .map((id) => this.databaseService.getTrackById(id))
      .filter((track) => track !== undefined);

    return { artists, albums, tracks };
  }

  addTrack(id: string): string {
    const track = this.databaseService.getTrackById(id);
    if (!track) {
      throw new UnprocessableEntityException('Track not found');
    }

    this.databaseService.addToFavorites('tracks', id);
    return 'Track added to favorites';
  }

  removeTrack(id: string): void {
    const isInFavorites = this.databaseService.isInFavorites('tracks', id);
    if (!isInFavorites) {
      throw new NotFoundException('Track is not in favorites');
    }

    this.databaseService.removeFromFavorites('tracks', id);
  }

  addAlbum(id: string): string {
    const album = this.databaseService.getAlbumById(id);
    if (!album) {
      throw new UnprocessableEntityException('Album not found');
    }

    this.databaseService.addToFavorites('albums', id);
    return 'Album added to favorites';
  }

  removeAlbum(id: string): void {
    const isInFavorites = this.databaseService.isInFavorites('albums', id);
    if (!isInFavorites) {
      throw new NotFoundException('Album is not in favorites');
    }

    this.databaseService.removeFromFavorites('albums', id);
  }

  addArtist(id: string): string {
    const artist = this.databaseService.getArtistById(id);
    if (!artist) {
      throw new UnprocessableEntityException('Artist not found');
    }

    this.databaseService.addToFavorites('artists', id);
    return 'Artist added to favorites';
  }

  removeArtist(id: string): void {
    const isInFavorites = this.databaseService.isInFavorites('artists', id);
    if (!isInFavorites) {
      throw new NotFoundException('Artist is not in favorites');
    }

    this.databaseService.removeFromFavorites('artists', id);
  }
}
