import { Body, Controller, HttpCode, HttpStatus, Logger, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { OrdersService } from '../service/orders.service';
import { CreateOrderDTO } from '../dto/create-order.dto';
import { OrderResponseDTO } from '../dto/order-response.dto';


@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  private logger = new Logger(OrdersController.name);

  @Post()
  @ApiOkResponse({ type: OrderResponseDTO })
  async create(@Body() dto: CreateOrderDTO): Promise<OrderResponseDTO> {
    try {
      return await this.service.create(dto);
    } catch (error) {
      this.logger.error('Error creating order', error);

      throw error;
    }
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: OrderResponseDTO })
  async cancel(@Param('id', ParseIntPipe) id: number): Promise<OrderResponseDTO> {
    try {
      return await this.service.cancel(id);
    } catch (error) {
      this.logger.error(`Error canceling order ${id}`, error);

      throw error;
    }
  }
}
