import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { UserRole } from "@/generated/prisma/enums";
import { Public } from "@/modules/auth/decorators/public.decorator";
import { Roles } from "@/modules/auth/decorators/roles.decorator";
import type {
  CreateDescribedTaxonomyDto,
  CreateDistrictDto,
  CreateProvinceDto,
  CreateTagDto,
  ReorderTaxonomyDto,
  SetTaxonomyActiveDto,
  UpdateDescribedTaxonomyDto,
  UpdateDistrictDto,
  UpdateProvinceDto,
  UpdateTagDto,
} from "@/modules/taxonomy/dto/taxonomy-management.dto";
import type {
  AdminDistrictQueryDto,
  AdminTaxonomyQueryDto,
  DistrictQueryDto,
  TaxonomyQueryDto,
} from "@/modules/taxonomy/dto/taxonomy-query.dto";
import {
  type DescribedTaxonomyItemDto,
  type DistrictItemDto,
  type TagItemDto,
  type TaxonomyItemDto,
  TaxonomyItemResponseDto,
  TaxonomyListResponseDto,
  TaxonomyMessageResponseDto,
} from "@/modules/taxonomy/dto/taxonomy-response.dto";
import { TaxonomyService } from "@/modules/taxonomy/taxonomy.service";

@ApiTags("Taxonomy")
@Controller("taxonomy")
class TaxonomyController {
  constructor(@Inject(TaxonomyService) private readonly taxonomyService: TaxonomyService) {}

  @Public()
  @Get("provinces")
  @ApiOperation({ summary: "List active provinces" })
  @ApiOkResponse({ type: TaxonomyListResponseDto<TaxonomyItemDto> })
  listPublicProvinces(@Query() query: TaxonomyQueryDto) {
    return this.taxonomyService.listPublicProvinces(query);
  }

  @Public()
  @Get("districts")
  @ApiOperation({ summary: "List active districts" })
  @ApiOkResponse({ type: TaxonomyListResponseDto<DistrictItemDto> })
  listPublicDistricts(@Query() query: DistrictQueryDto) {
    return this.taxonomyService.listPublicDistricts(query);
  }

  @Public()
  @Get("categories")
  @ApiOperation({ summary: "List active flat categories" })
  @ApiOkResponse({ type: TaxonomyListResponseDto<DescribedTaxonomyItemDto> })
  listPublicCategories(@Query() query: TaxonomyQueryDto) {
    return this.taxonomyService.listPublicCategories(query);
  }

  @Public()
  @Get("content-types")
  @ApiOperation({ summary: "List active content types" })
  @ApiOkResponse({ type: TaxonomyListResponseDto<DescribedTaxonomyItemDto> })
  listPublicContentTypes(@Query() query: TaxonomyQueryDto) {
    return this.taxonomyService.listPublicContentTypes(query);
  }

  @Public()
  @Get("tags")
  @ApiOperation({ summary: "List active global tags" })
  @ApiOkResponse({ type: TaxonomyListResponseDto<TagItemDto> })
  listPublicTags(@Query() query: TaxonomyQueryDto) {
    return this.taxonomyService.listPublicTags(query);
  }

  @Get("admin/provinces")
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin list provinces" })
  @ApiOkResponse({ type: TaxonomyListResponseDto<TaxonomyItemDto> })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  @ApiForbiddenResponse({ description: "AUTH_INSUFFICIENT_ROLE" })
  listAdminProvinces(@Query() query: AdminTaxonomyQueryDto) {
    return this.taxonomyService.listAdminProvinces(query);
  }

  @Post("admin/provinces")
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin create province" })
  @ApiOkResponse({ type: TaxonomyItemResponseDto<TaxonomyItemDto> })
  @ApiConflictResponse({ description: "TAXONOMY_DUPLICATE_NAME or TAXONOMY_DUPLICATE_SLUG" })
  createProvince(@Body() body: CreateProvinceDto) {
    return this.taxonomyService.createProvince(body);
  }

  @Patch("admin/provinces/reorder")
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin reorder provinces" })
  @ApiOkResponse({ type: TaxonomyMessageResponseDto })
  reorderProvinces(@Body() body: ReorderTaxonomyDto) {
    return this.taxonomyService.reorderProvinces(body);
  }

  @Patch("admin/provinces/:id")
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin update province" })
  @ApiOkResponse({ type: TaxonomyItemResponseDto<TaxonomyItemDto> })
  @ApiConflictResponse({ description: "TAXONOMY_DUPLICATE_NAME or TAXONOMY_DUPLICATE_SLUG" })
  @ApiNotFoundResponse({ description: "TAXONOMY_PROVINCE_NOT_FOUND" })
  updateProvince(@Param("id", ParseUUIDPipe) id: string, @Body() body: UpdateProvinceDto) {
    return this.taxonomyService.updateProvince(id, body);
  }

  @Patch("admin/provinces/:id/active")
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin enable or disable province" })
  @ApiOkResponse({ type: TaxonomyItemResponseDto<TaxonomyItemDto> })
  setProvinceActive(@Param("id", ParseUUIDPipe) id: string, @Body() body: SetTaxonomyActiveDto) {
    return this.taxonomyService.setProvinceActive(id, body);
  }

  @Get("admin/districts")
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin list districts" })
  @ApiOkResponse({ type: TaxonomyListResponseDto<DistrictItemDto> })
  listAdminDistricts(@Query() query: AdminDistrictQueryDto) {
    return this.taxonomyService.listAdminDistricts(query);
  }

  @Post("admin/districts")
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin create district" })
  @ApiOkResponse({ type: TaxonomyItemResponseDto<DistrictItemDto> })
  @ApiConflictResponse({ description: "TAXONOMY_DUPLICATE_NAME or TAXONOMY_DUPLICATE_SLUG" })
  createDistrict(@Body() body: CreateDistrictDto) {
    return this.taxonomyService.createDistrict(body);
  }

  @Patch("admin/districts/reorder")
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin reorder districts" })
  @ApiOkResponse({ type: TaxonomyMessageResponseDto })
  reorderDistricts(@Body() body: ReorderTaxonomyDto) {
    return this.taxonomyService.reorderDistricts(body);
  }

  @Patch("admin/districts/:id")
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin update district" })
  @ApiOkResponse({ type: TaxonomyItemResponseDto<DistrictItemDto> })
  updateDistrict(@Param("id", ParseUUIDPipe) id: string, @Body() body: UpdateDistrictDto) {
    return this.taxonomyService.updateDistrict(id, body);
  }

  @Patch("admin/districts/:id/active")
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin enable or disable district" })
  @ApiOkResponse({ type: TaxonomyItemResponseDto<DistrictItemDto> })
  setDistrictActive(@Param("id", ParseUUIDPipe) id: string, @Body() body: SetTaxonomyActiveDto) {
    return this.taxonomyService.setDistrictActive(id, body);
  }

  @Get("admin/categories")
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin list categories" })
  @ApiOkResponse({ type: TaxonomyListResponseDto<DescribedTaxonomyItemDto> })
  listAdminCategories(@Query() query: AdminTaxonomyQueryDto) {
    return this.taxonomyService.listAdminCategories(query);
  }

  @Post("admin/categories")
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin create flat category" })
  @ApiOkResponse({ type: TaxonomyItemResponseDto<DescribedTaxonomyItemDto> })
  createCategory(@Body() body: CreateDescribedTaxonomyDto) {
    return this.taxonomyService.createCategory(body);
  }

  @Patch("admin/categories/reorder")
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin reorder categories" })
  @ApiOkResponse({ type: TaxonomyMessageResponseDto })
  reorderCategories(@Body() body: ReorderTaxonomyDto) {
    return this.taxonomyService.reorderCategories(body);
  }

  @Patch("admin/categories/:id")
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin update flat category" })
  @ApiOkResponse({ type: TaxonomyItemResponseDto<DescribedTaxonomyItemDto> })
  updateCategory(@Param("id", ParseUUIDPipe) id: string, @Body() body: UpdateDescribedTaxonomyDto) {
    return this.taxonomyService.updateCategory(id, body);
  }

  @Patch("admin/categories/:id/active")
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin enable or disable category" })
  @ApiOkResponse({ type: TaxonomyItemResponseDto<DescribedTaxonomyItemDto> })
  setCategoryActive(@Param("id", ParseUUIDPipe) id: string, @Body() body: SetTaxonomyActiveDto) {
    return this.taxonomyService.setCategoryActive(id, body);
  }

  @Get("admin/content-types")
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin list content types" })
  @ApiOkResponse({ type: TaxonomyListResponseDto<DescribedTaxonomyItemDto> })
  listAdminContentTypes(@Query() query: AdminTaxonomyQueryDto) {
    return this.taxonomyService.listAdminContentTypes(query);
  }

  @Post("admin/content-types")
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin create content type" })
  @ApiOkResponse({ type: TaxonomyItemResponseDto<DescribedTaxonomyItemDto> })
  createContentType(@Body() body: CreateDescribedTaxonomyDto) {
    return this.taxonomyService.createContentType(body);
  }

  @Patch("admin/content-types/reorder")
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin reorder content types" })
  @ApiOkResponse({ type: TaxonomyMessageResponseDto })
  reorderContentTypes(@Body() body: ReorderTaxonomyDto) {
    return this.taxonomyService.reorderContentTypes(body);
  }

  @Patch("admin/content-types/:id")
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin update content type" })
  @ApiOkResponse({ type: TaxonomyItemResponseDto<DescribedTaxonomyItemDto> })
  updateContentType(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: UpdateDescribedTaxonomyDto,
  ) {
    return this.taxonomyService.updateContentType(id, body);
  }

  @Patch("admin/content-types/:id/active")
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin enable or disable content type" })
  @ApiOkResponse({ type: TaxonomyItemResponseDto<DescribedTaxonomyItemDto> })
  setContentTypeActive(@Param("id", ParseUUIDPipe) id: string, @Body() body: SetTaxonomyActiveDto) {
    return this.taxonomyService.setContentTypeActive(id, body);
  }

  @Get("admin/tags")
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin list tags" })
  @ApiOkResponse({ type: TaxonomyListResponseDto<TagItemDto> })
  listAdminTags(@Query() query: AdminTaxonomyQueryDto) {
    return this.taxonomyService.listAdminTags(query);
  }

  @Post("admin/tags")
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin create tag" })
  @ApiOkResponse({ type: TaxonomyItemResponseDto<TagItemDto> })
  createTag(@Body() body: CreateTagDto) {
    return this.taxonomyService.createTag(body);
  }

  @Patch("admin/tags/:id")
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin update tag" })
  @ApiOkResponse({ type: TaxonomyItemResponseDto<TagItemDto> })
  updateTag(@Param("id", ParseUUIDPipe) id: string, @Body() body: UpdateTagDto) {
    return this.taxonomyService.updateTag(id, body);
  }

  @Patch("admin/tags/:id/active")
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin enable or disable tag" })
  @ApiOkResponse({ type: TaxonomyItemResponseDto<TagItemDto> })
  setTagActive(@Param("id", ParseUUIDPipe) id: string, @Body() body: SetTaxonomyActiveDto) {
    return this.taxonomyService.setTagActive(id, body);
  }
}

export { TaxonomyController };
