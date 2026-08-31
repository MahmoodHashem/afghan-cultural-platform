import { Controller, Get, Inject, Param, Query } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { Public } from "../auth/decorators/public.decorator";
import { PublicEntryListResponseDto, PublicEntryResponseDto } from "./dto/entry-response.dto";
import { PublicEntryQueryDto } from "./dto/public-entry-query.dto";
import { EntriesService } from "./entries.service";

@ApiTags("Public Entries")
@ApiExtraModels(PublicEntryQueryDto)
@Public()
@Controller("entries")
class PublicEntriesController {
  constructor(@Inject(EntriesService) private readonly entriesService: EntriesService) {}

  @Get()
  @ApiOperation({
    summary: "List published Cultural Entries",
    description:
      "Public read-only listing and Persian-normalized keyword search. Only PUBLISHED entries with a publication timestamp and public slug are returned. Full Tiptap content and moderation data are excluded.",
  })
  @ApiOkResponse({ type: PublicEntryListResponseDto })
  @ApiBadRequestResponse({ description: "ENTRY_QUERY_INVALID or ENTRY_FILTER_INVALID" })
  listPublishedEntries(@Query() query: PublicEntryQueryDto) {
    return this.entriesService.listPublishedEntries(query);
  }

  @Get(":slug")
  @ApiOperation({
    summary: "Read one published Cultural Entry by slug",
    description:
      "Returns complete public entry data for one published entry. Drafts, pending entries, hidden entries, archived entries, and rejected entries return 404.",
  })
  @ApiOkResponse({ type: PublicEntryResponseDto })
  @ApiBadRequestResponse({ description: "ENTRY_QUERY_INVALID" })
  @ApiNotFoundResponse({ description: "ENTRY_NOT_FOUND" })
  getPublishedEntryBySlug(@Param("slug") slug: string) {
    return this.entriesService.getPublishedEntryBySlug(slug);
  }
}

export { PublicEntriesController };
