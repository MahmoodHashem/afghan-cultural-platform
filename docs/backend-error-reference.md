# Backend Error Reference

This document inventories error responses currently emitted by the NestJS API and intended for frontend mapping. It reflects the raw English messages currently in the backend source; it is not a localization catalog.

## Response Shape

All HTTP exceptions pass through `HttpExceptionFilter` and are returned as:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Raw backend message",
    "fieldErrors": []
  },
  "requestId": "...",
  "timestamp": "..."
}
```

The filter derives `error.code` from the exception payload's `error` property. If no explicit code exists, it uses the HTTP status name, such as `BAD_REQUEST`, `UNAUTHORIZED`, or `NOT_FOUND`.

## Explicit Domain Errors

Each row is one unique code/message pair. A code may have multiple rows because the current backend uses different raw messages for different failure paths.

| Code | Current raw backend message |
| --- | --- |
| `ADMIN_ENTRY_ALREADY_ARCHIVED` | `The entry already has the requested lifecycle status.` |
| `ADMIN_ENTRY_ALREADY_RESTORED` | `The entry already has the requested lifecycle status.` |
| `ADMIN_ENTRY_INVALID_STATUS` | `The entry cannot perform this lifecycle transition.` |
| `ADMIN_ENTRY_INVALID_STATUS` | `Only previously published entries can be restored.` |
| `ADMIN_ENTRY_LIFECYCLE_CONFLICT` | `The entry lifecycle changed before this action completed.` |
| `ADMIN_ENTRY_NOT_FOUND` | `Cultural Entry was not found.` |
| `ADMIN_ENTRY_REASON_REQUIRED` | `A reason of at least 3 characters is required.` |
| `ADMIN_USER_ALREADY_ACTIVE` | `The user already has the requested status.` |
| `ADMIN_USER_ALREADY_SUSPENDED` | `The user already has the requested status.` |
| `ADMIN_USER_NOT_FOUND` | `User was not found.` |
| `ADMIN_USER_SELF_ACTION_FORBIDDEN` | `Administrators cannot change their own account status.` |
| `ADMIN_USER_STATUS_CONFLICT` | `The user status changed before this action completed.` |
| `ADMIN_USER_SUSPENSION_REASON_REQUIRED` | `A suspension reason of at least 3 characters is required.` |
| `AUTH_ACCOUNT_SUSPENDED` | `Account is suspended.` |
| `AUTH_EMAIL_ALREADY_REGISTERED` | `This email is already registered.` |
| `AUTH_EMAIL_VERIFICATION_REQUIRED` | `Verified email is required for this action.` |
| `AUTH_FACEBOOK_ACCOUNT_ALREADY_LINKED` | `Facebook account is already linked.` |
| `AUTH_FACEBOOK_AUTH_FAILED` | `Facebook authentication failed.` |
| `AUTH_FACEBOOK_EMAIL_LINKING_NOT_ALLOWED` | `Facebook email cannot be safely used for automatic account linking.` |
| `AUTH_FACEBOOK_EMAIL_REQUIRED` | `Facebook did not provide an email address.` |
| `AUTH_GOOGLE_ACCOUNT_ALREADY_LINKED` | `Google account is already linked.` |
| `AUTH_GOOGLE_AUTH_FAILED` | `Google authentication failed.` |
| `AUTH_GOOGLE_EMAIL_NOT_VERIFIED` | `Provider email must be verified before account linking.` |
| `AUTH_GOOGLE_EMAIL_NOT_VERIFIED` | `Google email must be verified before authentication.` |
| `AUTH_INSUFFICIENT_ROLE` | `This route requires a different role.` |
| `AUTH_INVALID_CREDENTIALS` | `Invalid email or password.` |
| `AUTH_PASSWORD_ALREADY_CONFIGURED` | `Password is already configured for this account.` |
| `AUTH_PASSWORD_NOT_CONFIGURED` | `Password login is not configured for this account.` |
| `AUTH_PASSWORD_RESET_TOKEN_EXPIRED` | `Password reset token has expired.` |
| `AUTH_PASSWORD_RESET_TOKEN_INVALID` | `Password reset token is invalid.` |
| `AUTH_PASSWORD_RESET_TOKEN_USED` | `Password reset token has already been used.` |
| `AUTH_PASSWORD_TOO_WEAK` | `Password must be 10-128 characters and include uppercase, lowercase, and number characters.` |
| `AUTH_REFRESH_TOKEN_EXPIRED` | `Refresh token has expired.` |
| `AUTH_REFRESH_TOKEN_INVALID` | `Refresh token is invalid.` |
| `AUTH_REFRESH_TOKEN_INVALID` | `Refresh token payload is invalid.` |
| `AUTH_REFRESH_TOKEN_MISSING` | `Refresh token cookie is missing.` |
| `AUTH_REFRESH_TOKEN_REVOKED` | `Refresh token session has been revoked.` |
| `AUTH_SESSION_NOT_FOUND` | `Refresh session was not found.` |
| `AUTH_UNAUTHORIZED` | `Authentication is required.` |
| `AUTH_UNAUTHORIZED` | `Invalid access token payload.` |
| `AUTH_UNAUTHORIZED` | `Invalid access token user.` |
| `AUTH_VERIFICATION_TOKEN_EXPIRED` | `Verification token has expired.` |
| `AUTH_VERIFICATION_TOKEN_INVALID` | `Verification token is invalid.` |
| `COMMENT_BODY_INVALID` | `Comment body must be between 5 and 1000 normalized characters.` |
| `COMMENT_NOT_OWNED` | `Comment does not belong to the current user.` |
| `COMMENT_NOT_FOUND` | `Comment was not found.` |
| `COMMENT_PARENT_INVALID` | `Parent comment must belong to the same entry.` |
| `COMMENT_PARENT_UNAVAILABLE` | `Parent comment is not available.` |
| `COMMENT_SELF_LIKE_FORBIDDEN` | `Users cannot like their own comments.` |
| `COMMENT_UNAVAILABLE` | `Comment is not available.` |
| `COMMUNITY_ENTRY_NOT_FOUND` | `Published entry was not found.` |
| `CORRECTION_ALREADY_DECIDED` | `Correction has already been decided.` |
| `CORRECTION_ALREADY_PENDING` | `A pending correction already exists for this section.` |
| `CORRECTION_CONFLICT` | `The published entry is no longer available for correction.` |
| `CORRECTION_CONFLICT` | `Correction conflict.` |
| `CORRECTION_CONTENT_INVALID` | `Unsupported correction section.` |
| `CORRECTION_CONTENT_INVALID` | `Correction content is invalid.` |
| `CORRECTION_ENTRY_NOT_FOUND` | `Published entry was not found.` |
| `CORRECTION_NOT_FOUND` | `Correction was not found.` |
| `CORRECTION_SELF_REVIEW_FORBIDDEN` | `A moderator cannot accept their own correction.` |
| `ENTRY_CONTENT_INVALID` | Dynamic Tiptap validation message, or a caller-supplied required-text message such as `Summary is required.` or `Image alt text is required.` |
| `ENTRY_DISTRICT_PROVINCE_MISMATCH` | `District does not belong to the selected province.` |
| `ENTRY_FILTER_INVALID` | `District filter is invalid.` |
| `ENTRY_FILTER_INVALID` | `District does not belong to the selected province.` |
| `ENTRY_GEOGRAPHY_INVALID` | Dynamic geography message, such as `Province is required for provincial Cultural Entries.` |
| `ENTRY_INVALID_STATUS` | `Only draft or changes-requested entries can be edited.` |
| `ENTRY_INVALID_STATUS` | `Only unsubmitted drafts can be hard-deleted.` |
| `ENTRY_INVALID_STATUS` | `Only draft or changes-requested entries can be submitted.` |
| `ENTRY_INVALID_STATUS` | `Entry status changed before submission could be completed.` |
| `ENTRY_NOT_FOUND` | `Entry was not found.` |
| `ENTRY_QUERY_INVALID` | Dynamic query message, such as `${field} must be a valid UUID.` |
| `ENTRY_QUERY_INVALID` | Dynamic query message, such as `${field} must be a valid slug.` |
| `ENTRY_QUERY_INVALID` | `Public entry sort value is invalid.` |
| `ENTRY_REFERENCE_ANCHOR_INVALID` | `Internal entry reference anchor text is invalid.` |
| `ENTRY_REFERENCE_DUPLICATE` | `Duplicate internal entry references are not allowed.` |
| `ENTRY_REFERENCE_SELF` | `An entry cannot reference itself.` |
| `ENTRY_REFERENCE_TARGET_INVALID` | `Internal entry reference target is invalid.` |
| `ENTRY_REVISION_CONFLICT` | `Entry revision changed before this action completed.` |
| `ENTRY_REVISION_INVALID_STATUS` | `Revision reason is required.` |
| `ENTRY_REVISION_NOT_FOUND` | `Entry revision was not found.` |
| `ENTRY_REVISION_STALE` | `Entry revision changed before this action completed.` |
| `ENTRY_SOURCE_INVALID` | `Only HTTP and HTTPS source URLs are supported.` |
| `ENTRY_SOURCE_INVALID` | `Source URL is invalid.` |
| `ENTRY_SOURCE_INVALID` | `Source date is invalid.` |
| `ENTRY_SOURCE_INVALID` | `Duplicate source IDs are not allowed.` |
| `ENTRY_SOURCE_NOT_FOUND` | `Source was not found.` |
| `ENTRY_SOURCE_NOT_FOUND` | `Entry revision was not found.` |
| `ENTRY_SOURCE_ORDER_DUPLICATE` | `Duplicate source display order values are not allowed.` |
| `ENTRY_SUBMISSION_INCOMPLETE` | `Title, summary, and content are required for submission.` |
| `ENTRY_SUBMISSION_INCOMPLETE` | `Entry slug is required before submission.` |
| `ENTRY_SUBMISSION_INCOMPLETE` | `Inactive tags cannot be submitted.` |
| `ENTRY_SUBMISSION_REFERENCE_INVALID` | `An entry cannot reference itself.` |
| `ENTRY_SUBMISSION_REFERENCE_INVALID` | `Duplicate internal entry references are not allowed.` |
| `ENTRY_SUBMISSION_REFERENCE_INVALID` | `Internal entry references are out of sync.` |
| `ENTRY_SUBMISSION_REFERENCE_INVALID` | `Internal entry reference target is not published.` |
| `ENTRY_TAG_DUPLICATE` | `Duplicate tags are not allowed.` |
| `ENTRY_TAG_INVALID` | `One or more tags are invalid.` |
| `IMAGE_DELETE_FAILED` | `Image delete failed.` |
| `IMAGE_INVALID_TYPE` | `Image file is required.` |
| `IMAGE_INVALID_TYPE` | `Only valid JPEG, PNG, and WebP images are supported.` |
| `IMAGE_LIMIT_EXCEEDED` | `Maximum image count for this entry has been reached.` |
| `IMAGE_NOT_FOUND` | `Image was not found.` |
| `IMAGE_ORDER_DUPLICATE` | `Duplicate image display order values are not allowed.` |
| `IMAGE_PERMISSION_REQUIRED` | `Image permission confirmation is required.` |
| `IMAGE_TOO_LARGE` | `Image file is too large.` |
| `IMAGE_UPLOAD_FAILED` | `Image upload failed.` |
| `MODERATION_ALREADY_DECIDED` | `This submission has already been decided.` |
| `MODERATION_CONFLICT` | `Another moderator already changed this submission.` |
| `MODERATION_REASON_REQUIRED` | `Moderation reason is required.` |
| `MODERATION_SELF_APPROVAL_FORBIDDEN` | `A moderator cannot approve their own submission.` |
| `MODERATION_SUBMISSION_NOT_FOUND` | `Moderation submission was not found.` |
| `PROFILE_BIOGRAPHY_INVALID` | `Biography must be at most 600 characters.` |
| `PROFILE_BOOKMARK_ENTRY_NOT_FOUND` | `Published entry was not found.` |
| `PROFILE_CULTURAL_INTEREST_INVALID` | `Cultural interests must be between 2 and 60 characters each.` |
| `PROFILE_DISPLAY_NAME_INVALID` | `Display name must be between 2 and 80 characters.` |
| `PROFILE_IMAGE_INVALID_TYPE` | `Profile image is required.` |
| `PROFILE_IMAGE_INVALID_TYPE` | `Only valid JPEG, PNG, and WebP images are supported.` |
| `PROFILE_IMAGE_TOO_LARGE` | `Profile image is too large.` |
| `PROFILE_NOT_FOUND` | `Profile was not found.` |
| `PROFILE_PROVINCE_INVALID` | `Province is invalid or inactive.` |
| `REPORT_ACTION_INVALID` | `Resolution action is not valid for this report target.` |
| `REPORT_ALREADY_OPEN` | `An unresolved report already exists for this target.` |
| `REPORT_ALREADY_RESOLVED` | `Report has already been resolved.` |
| `REPORT_CONFLICT` | `Report conflict.` |
| `REPORT_CONFLICT` | `Comment is no longer active.` |
| `REPORT_NOT_FOUND` | `Report was not found.` |
| `REPORT_TARGET_NOT_FOUND` | `Report target not found.` |
| `TAXONOMY_DUPLICATE_NAME` | `Taxonomy name already exists.` |
| `TAXONOMY_DUPLICATE_NAME` | `District name already exists.` |
| `TAXONOMY_DUPLICATE_NAME` | `Tag name already exists.` |
| `TAXONOMY_DUPLICATE_SLUG` | `Taxonomy slug already exists.` |
| `TAXONOMY_DUPLICATE_SLUG` | `District slug already exists.` |
| `TAXONOMY_DUPLICATE_SLUG` | `Tag slug already exists.` |
| `TAXONOMY_DUPLICATE_SLUG` | `Taxonomy item violates a unique constraint.` |
| `TAXONOMY_INVALID_REORDER_ITEMS` | `Reorder list contains duplicate items.` |
| `TAXONOMY_NOT_FOUND` | `District was not found.` |
| `TAXONOMY_NOT_FOUND` | `Taxonomy item was not found.` |
| `TAXONOMY_NOT_FOUND` | `Tag was not found.` |
| `TAXONOMY_PROVINCE_IMAGE_ALT_REQUIRED` | `Province image alt text is required.` |
| `TAXONOMY_PROVINCE_IMAGE_NOT_FOUND` | `Province image was not found.` |
| `TAXONOMY_PROVINCE_NOT_FOUND` | `Province was not found.` |
| `YOUTUBE_METADATA_UNAVAILABLE` | `YouTube metadata is temporarily unavailable.` |
| `YOUTUBE_URL_INVALID` | `YouTube URL is invalid.` |
| `YOUTUBE_VIDEO_NOT_FOUND` | `YouTube video was not found.` |
| `YOUTUBE_VIDEO_NOT_FOUND` | `YouTube video was not found or is unavailable.` |

## Validation Errors

Global validation is configured in `apps/api/src/main.ts` with `whitelist: true`, `forbidNonWhitelisted: true`, and `transform: true`. The exception filter converts validation responses to code `BAD_REQUEST` and message `Validation failed`:

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Validation failed",
    "fieldErrors": [
      {
        "field": "email",
        "message": "email must be an email"
      }
    ]
  }
}
```

The raw `fieldErrors[].message` values are generated by `class-validator` and vary by DTO field and configured constraint:

| Raw message pattern | Typical source constraint |
| --- | --- |
| `$property must be a string` | `@IsString()` |
| `$property must be an email` | `@IsEmail()` |
| `$property must not be less than N characters` | `@MinLength(N)` |
| `$property must not be greater than N characters` | `@MaxLength(N)` |
| `$property should not be empty` | `@IsNotEmpty()` |
| `$property must be an object` | `@IsObject()` |
| `$property must be one of the following values: ...` | `@IsEnum()` |
| `$property must be a UUID` | `@IsUUID()` |
| `$property must be an integer number` | `@IsInt()` |
| `$property must be a boolean value` | `@IsBoolean()` |
| `$property must be an array` | `@IsArray()` |
| `$property must be a URL address` | `@IsUrl()` |
| `$property must be a valid ISO 8601 date string` | `@IsDateString()` |
| `property $property should not exist` | `forbidNonWhitelisted: true` |
| `password must include uppercase, lowercase, and number characters` | Password `@Matches()` |
| `newPassword must include uppercase, lowercase, and number characters` | Password `@Matches()` |
| `slug must contain lowercase Latin letters, numbers, and single hyphens only` | Taxonomy slug `@Matches()` |

The exact field name and numeric constraint are substituted at runtime, so frontend mapping should use the field name and/or validation metadata rather than treating every validation message as a fixed string.

## Declared but Not Currently Emitted

These constants exist in module error-code declarations but have no current production emission site in `apps/api/src`. They are not included in the active code/message inventory above:

| Declared code | Source |
| --- | --- |
| `ENTRY_NOT_OWNED` | `apps/api/src/modules/entries/entries.constants.ts` |
| `YOUTUBE_VIDEO_ALREADY_EXISTS` | `apps/api/src/modules/entries/entries.constants.ts` |
| `PROFILE_BOOKMARK_NOT_FOUND` | `apps/api/src/modules/profile/profile.constants.ts` |
| `PROFILE_QUERY_INVALID` | `apps/api/src/modules/profile/profile.constants.ts` |
| `TAXONOMY_INVALID_SLUG` | `apps/api/src/modules/taxonomy/taxonomy.constants.ts` |

## Framework and Fallback Errors

| Code | Current raw backend message |
| --- | --- |
| `BAD_REQUEST` | `Validation failed` for DTO validation arrays. |
| `HTTP_ERROR` | The exception message when an HTTP exception status has no recognized Nest status-name mapping. |
| `INTERNAL_SERVER_ERROR` | `Internal server error` in production. |
| `INTERNAL_SERVER_ERROR` | The raw unexpected `Error.message` outside production. |
| `NOT_FOUND` | `Cannot GET /api/v1/unknown-path` or the equivalent Nest routing message. |
| `SERVICE_UNAVAILABLE` | `The database is unavailable.` from the health check. The supplied `DATABASE_UNAVAILABLE` payload value is not used by the filter because it reads the payload's `error` property. |
| `TOO_MANY_REQUESTS` | `Throttler: Too Many Requests`. |
| `UNAUTHORIZED` | `Invalid or suspended user`. |

## Source Notes

- Global normalization: `apps/api/src/common/filters/http-exception.filter.ts`
- Validation setup: `apps/api/src/main.ts`
- Domain code declarations: `apps/api/src/modules/**/**.constants.ts`
- Explicit domain messages: services and guards under `apps/api/src/modules/**`
- The frontend should map by `error.code` first, then use field-level mapping for `BAD_REQUEST.fieldErrors`; raw `message` should be treated as a fallback during the localization phase.
- Success messages are intentionally excluded because they do not represent errors and are not passed through the exception filter.
