import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../database/database.service';
import { Track } from '../interfaces/track.interface';
import { CreateTrackDto, UpdateTrackDto } from '../dto/track.dto';

@Injectable()
export class TrackService {
  constructor(private readonly databaseService: DatabaseService) {}

  findAll(): Track[] {
    return this.databaseService.getTracks();
  }

  findOne(id: string): Track {
    const track = this.databaseService.getTrackById(id);
    if (!track) {
      throw new NotFoundException('Track not found');
    }
    return track;
  }

  create(createTrackDto: CreateTrackDto): Track {
    const track: Track = {
      id: randomUUID(),
      name: createTrackDto.name,
      artistId: createTrackDto.artistId,
      albumId: createTrackDto.albumId,
      duration: createTrackDto.duration,
    };

    return this.databaseService.addTrack(track);
  }

  update(id: string, updateTrackDto: UpdateTrackDto): Track {
    const track = this.databaseService.getTrackById(id);
    if (!track) {
      throw new NotFoundException('Track not found');
    }

    const updatedTrack = this.databaseService.updateTrack(id, updateTrackDto);
    return updatedTrack!;
  }

  remove(id: string): void {
    const track = this.databaseService.getTrackById(id);
    if (!track) {
      throw new NotFoundException('Track not found');
    }

    this.databaseService.deleteTrack(id);
  }
}
