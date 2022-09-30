import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from './report.entity';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dtos/create-report.dto';
import { User } from '../users/user.entity';
import { GetEstimateDto } from './dtos/get-estimate.dto';

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {}
  //1createEstimate({make}: GetEstimateDto) {
  createEstimate(estimateDto: GetEstimateDto) {
    return (
      this.repo
        .createQueryBuilder()
        //.select('*')
        .select('AVG(price)', 'price')
        //1.where('make = :make', { make })
        //where make column value is same as estimateDto.make
        //.where('make = estimateDto.make', { make: estimateDto.make })
        .where('make = :make', { make: estimateDto.make })
        .andWhere('model = :model', { model: estimateDto.model })
        .andWhere('lng - :lng BETWEEN -5 AND 5', { lng: estimateDto.lng })
        .andWhere('lat - :lat BETWEEN -5 AND 5', { lat: estimateDto.lat })
        .andWhere('year - :year BETWEEN -3 AND 3', { year: estimateDto.year })
        .andWhere('approved IS TRUE')
        .orderBy('ABS(mileage - :mileage)', 'DESC')
        .setParameters({ mileage: estimateDto.mileage })
        //Use only top 3 first values for calculation
        .limit(3)
        //.getRawMany()
        //expect to get back only one answer
        .getRawOne()
    );
  }

  create(reportDto: CreateReportDto, user: User) {
    const report = this.repo.create(reportDto);
    //Connect user to report
    report.user = user;

    return this.repo.save(report);
  }
  async changeApproval(id: string, approved: boolean) {
    const report = await this.repo.findOne(id);

    if (!report) {
      throw new NotFoundException('report not found');
    }
    //This is new value of approved
    report.approved = approved;
    //Save new report to database
    return this.repo.save(report);
  }
}
