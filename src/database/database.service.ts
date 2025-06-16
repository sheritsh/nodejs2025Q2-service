import { Injectable } from '@nestjs/common';
import { User } from '../interfaces/user.interface';
import { Artist } from '../interfaces/artist.interface';
import { Track } from '../interfaces/track.interface';
import { Album } from '../interfaces/album.interface';
import { Favorites } from '../interfaces/favorites.interface';

@Injectable()
export class DatabaseService {
  private users: User[] = [];
  private artists: Artist[] = [];
  private tracks: Track[] = [];
  private albums: Album[] = [];
  private favorites: Favorites = {
    artists: [],
    albums: [],
    tracks: [],
  };

  getUsers(): User[] {
    return this.users;
  }

  getUserById(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  addUser(user: User): User {
    this.users.push(user);
    return user;
  }

  updateUser(id: string, updatedUser: Partial<User>): User | undefined {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) return undefined;

    this.users[index] = { ...this.users[index], ...updatedUser };
    return this.users[index];
  }

  deleteUser(id: string): boolean {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) return false;

    this.users.splice(index, 1);
    return true;
  }

  getArtists(): Artist[] {
    return this.artists;
  }

  getArtistById(id: string): Artist | undefined {
    return this.artists.find((artist) => artist.id === id);
  }

  addArtist(artist: Artist): Artist {
    this.artists.push(artist);
    return artist;
  }

  updateArtist(id: string, updatedArtist: Partial<Artist>): Artist | undefined {
    const index = this.artists.findIndex((artist) => artist.id === id);
    if (index === -1) return undefined;

    this.artists[index] = { ...this.artists[index], ...updatedArtist };
    return this.artists[index];
  }

  deleteArtist(id: string): boolean {
    const index = this.artists.findIndex((artist) => artist.id === id);
    if (index === -1) return false;

    this.artists.splice(index, 1);

    this.tracks.forEach((track) => {
      if (track.artistId === id) {
        track.artistId = null;
      }
    });

    this.albums.forEach((album) => {
      if (album.artistId === id) {
        album.artistId = null;
      }
    });

    this.favorites.artists = this.favorites.artists.filter(
      (artistId) => artistId !== id,
    );

    return true;
  }

  getTracks(): Track[] {
    return this.tracks;
  }

  getTrackById(id: string): Track | undefined {
    return this.tracks.find((track) => track.id === id);
  }

  addTrack(track: Track): Track {
    this.tracks.push(track);
    return track;
  }

  updateTrack(id: string, updatedTrack: Partial<Track>): Track | undefined {
    const index = this.tracks.findIndex((track) => track.id === id);
    if (index === -1) return undefined;

    this.tracks[index] = { ...this.tracks[index], ...updatedTrack };
    return this.tracks[index];
  }

  deleteTrack(id: string): boolean {
    const index = this.tracks.findIndex((track) => track.id === id);
    if (index === -1) return false;

    this.tracks.splice(index, 1);
    this.favorites.tracks = this.favorites.tracks.filter(
      (trackId) => trackId !== id,
    );

    return true;
  }

  getAlbums(): Album[] {
    return this.albums;
  }

  getAlbumById(id: string): Album | undefined {
    return this.albums.find((album) => album.id === id);
  }

  addAlbum(album: Album): Album {
    this.albums.push(album);
    return album;
  }

  updateAlbum(id: string, updatedAlbum: Partial<Album>): Album | undefined {
    const index = this.albums.findIndex((album) => album.id === id);
    if (index === -1) return undefined;

    this.albums[index] = { ...this.albums[index], ...updatedAlbum };
    return this.albums[index];
  }

  deleteAlbum(id: string): boolean {
    const index = this.albums.findIndex((album) => album.id === id);
    if (index === -1) return false;

    this.albums.splice(index, 1);

    this.tracks.forEach((track) => {
      if (track.albumId === id) {
        track.albumId = null;
      }
    });

    this.favorites.albums = this.favorites.albums.filter(
      (albumId) => albumId !== id,
    );

    return true;
  }

  getFavorites(): Favorites {
    return this.favorites;
  }

  addToFavorites(type: 'artists' | 'albums' | 'tracks', id: string): boolean {
    if (!this.favorites[type].includes(id)) {
      this.favorites[type].push(id);
      return true;
    }
    return false;
  }

  removeFromFavorites(
    type: 'artists' | 'albums' | 'tracks',
    id: string,
  ): boolean {
    const index = this.favorites[type].indexOf(id);
    if (index !== -1) {
      this.favorites[type].splice(index, 1);
      return true;
    }
    return false;
  }

  isInFavorites(type: 'artists' | 'albums' | 'tracks', id: string): boolean {
    return this.favorites[type].includes(id);
  }
}
