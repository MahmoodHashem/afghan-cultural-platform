import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { memoryStorage } from "multer";

import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequireVerifiedEmail } from "../auth/decorators/require-verified-email.decorator";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { UpdateEntryDraftDto } from "./dto/create-entry-draft.dto";
import { UpdateEntryImageMetadataDto, UploadEntryImageDto } from "./dto/entry-images.dto";
import { ReplaceRevisionTagsDto } from "./dto/entry-revision.dto";
import { CreateEntrySourceDto, UpdateEntrySourceDto } from "./dto/entry-sources.dto";
import { UpsertEntryYouTubeVideoDto } from "./dto/entry-youtube.dto";
import { EntryRevisionsService } from "./entry-revisions.service";

@ApiTags("Entry revisions")
@ApiBearerAuth()
@RequireVerifiedEmail()
@Controller("me/entries/:entryId/revision")
class EntryRevisionsController {
  constructor(
    @Inject(EntryRevisionsService)
    private readonly revisionsService: EntryRevisionsService,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create or resume a private revision of a published entry" })
  start(@CurrentUser() user: AuthenticatedUser, @Param("entryId", ParseUUIDPipe) entryId: string) {
    return this.revisionsService.startOwnRevision(user, entryId);
  }

  @Get()
  get(@CurrentUser() user: AuthenticatedUser, @Param("entryId", ParseUUIDPipe) entryId: string) {
    return this.revisionsService.getOwnRevision(user, entryId);
  }

  @Patch()
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
    @Body() body: UpdateEntryDraftDto,
  ) {
    return this.revisionsService.updateOwnRevision(user, entryId, body);
  }

  @Delete()
  cancel(@CurrentUser() user: AuthenticatedUser, @Param("entryId", ParseUUIDPipe) entryId: string) {
    return this.revisionsService.cancelOwnRevision(user, entryId);
  }

  @Post("submit")
  submit(@CurrentUser() user: AuthenticatedUser, @Param("entryId", ParseUUIDPipe) entryId: string) {
    return this.revisionsService.submitOwnRevision(user, entryId);
  }

  @Patch("tags")
  replaceTags(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
    @Body() body: ReplaceRevisionTagsDto,
  ) {
    return this.revisionsService.replaceTags(user, entryId, body.tagIds);
  }

  @Post("sources")
  createSource(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
    @Body() body: CreateEntrySourceDto,
  ) {
    return this.revisionsService.createSource(user, entryId, body);
  }

  @Patch("sources/:sourceId")
  updateSource(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
    @Param("sourceId", ParseUUIDPipe) sourceId: string,
    @Body() body: UpdateEntrySourceDto,
  ) {
    return this.revisionsService.updateSource(user, entryId, sourceId, body);
  }

  @Delete("sources/:sourceId")
  deleteSource(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
    @Param("sourceId", ParseUUIDPipe) sourceId: string,
  ) {
    return this.revisionsService.deleteSource(user, entryId, sourceId);
  }

  @Post("images")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("image", { storage: memoryStorage() }))
  uploadImage(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
    @Body() body: UploadEntryImageDto,
    @UploadedFile() image: Express.Multer.File | undefined,
  ) {
    return this.revisionsService.uploadImage(user, entryId, body, image);
  }

  @Delete("images/:imageId")
  deleteImage(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
    @Param("imageId", ParseUUIDPipe) imageId: string,
  ) {
    return this.revisionsService.deleteImage(user, entryId, imageId);
  }

  @Patch("images/:imageId")
  updateImage(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
    @Param("imageId", ParseUUIDPipe) imageId: string,
    @Body() body: UpdateEntryImageMetadataDto,
  ) {
    return this.revisionsService.updateImage(user, entryId, imageId, body);
  }

  @Post("youtube-video")
  upsertVideo(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
    @Body() body: UpsertEntryYouTubeVideoDto,
  ) {
    return this.revisionsService.upsertVideo(user, entryId, body);
  }

  @Delete("youtube-video")
  removeVideo(
    @CurrentUser() user: AuthenticatedUser,
    @Param("entryId", ParseUUIDPipe) entryId: string,
  ) {
    return this.revisionsService.removeVideo(user, entryId);
  }
}

export { EntryRevisionsController };
