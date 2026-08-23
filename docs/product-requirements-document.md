
## Afghan Cultural Information Crowdsourcing Platform

**Document version:** 1.0  
**Product language:** Persian  
**Platform type:** Web application  
**Development status:** Requirements-definition stage  
**Technology:** To be selected after approval of this document

---

# 1. Product Overview

The product is a centralized Persian-language crowdsourced web platform for collecting, organizing, reviewing, preserving, and sharing Afghan cultural information.

Registered users can contribute cultural articles, stories, images, sources, and YouTube videos. Submitted content is not published immediately. A moderator reviews each contribution and may approve it, reject it, or return it to the contributor for correction.

Visitors can search and browse approved content by keyword, province, category, tag, and content type. Registered users can also like content, save bookmarks, join entry discussions, suggest corrections, and report inaccurate or inappropriate information.

The main product process is:

> Cultural knowledge is submitted → reviewed → published → discovered by users → improved through corrections and reports.

---

# 2. Product Vision

The platform aims to provide one organized and accessible place where Afghan cultural information from different provinces and communities can be documented and discovered.

The platform should:

- Make Afghan cultural information easier to access.
    
- Allow communities to contribute their cultural knowledge.
    
- Organize information by province, category, tag, and content type.
    
- Support cultural articles, stories, images, and YouTube videos.
    
- Prevent direct publication of unreviewed content.
    
- Allow inaccurate information to be reported or corrected.
    
- Preserve the history of important content changes.
    
- Support students, teachers, researchers, cultural contributors, and the public.
    

The system will not present every contribution as an unquestionable historical fact. Some content may represent oral history, local memory, personal experience, or a regional interpretation.

---

# 3. Product Objectives

The first version has the following objectives:

1. Create a centralized platform for Afghan cultural information.
    
2. Allow registered users to contribute cultural content.
    
3. Organize content using consistent provinces, categories, tags, and content types.
    
4. Review contributions before public publication.
    
5. Allow visitors to search and browse cultural information easily.
    
6. Allow users to suggest corrections and report inaccurate content.
    
7. Preserve submission, review, and revision history.
    
8. Provide a simple Persian and right-to-left user experience.
    

---

# 4. First-Version Scope

## 4.1 Included features

The first version will include:

- Persian user interface
    
- Right-to-left layout
    
- User registration and login
    
- User profiles
    
- Password reset
    
- Role-based access
    
- Cultural-content creation
    
- Draft saving
    
- Image uploads
    
- YouTube video links
    
- Sources and references
    
- Province selection
    
- Category selection
    
- Tags
    
- Submission for moderation
    
- Approval, rejection, and changes-requested workflow
    
- Public content pages
    
- Search and filters
    
- Public entry comments and replies
    
- Correction suggestions
    
- Content reports
    
- Content-version history
    
- User dashboard
    
- Moderator dashboard
    
- Administrator dashboard
    
- Category and province management
    
- Basic platform statistics
    
- Audit records
    

## 4.2 Excluded features

The following are not included in the first version:

- Direct video-file uploads
    
- Audio-file uploads
    
- Email or in-platform notifications
    
- Multiple interface languages
    
- Content translations
    
- Language filters
    
- Mobile application
    
- Artificial-intelligence search
    
- AI-generated content
    
- Automatic translation
    
- Interactive map
    
- Contributor badges
    
- Expert-verification certificates
    
- Institutional accounts
    
- Public API
    
- Linked Open Data
    
- Offline access
    
- Advanced recommendation system
    
- Real-time chat
    
- Social-network features
    

These features may be considered for future versions.

---

# 5. Product Language Requirements

The first version will use Persian only.

This means:

- The complete interface will be in Persian.
    
- Forms and validation messages will be in Persian.
    
- Main cultural content will be submitted in Persian.
    
- The layout will be right-to-left.
    
- There will be no language-selection option.
    
- There will be no language field for cultural content.
    
- There will be no translation workflow.
    
- Search will be optimized for Persian text.
    

The system should handle common Persian and Arabic character variations during search, including:

- `ی` and `ي`
    
- `ک` and `ك`
    
- Different spaces and half-spaces
    
- Optional diacritical marks
    
- Persian and English numbers where relevant
    

Sources may keep their original titles when necessary, but the platform interface and cultural descriptions will remain Persian.

---

# 6. User Types and Roles

The first version will have three stored roles. A visitor is not a stored role because the visitor has not logged in.

## 6.1 Visitor

A visitor can:

- View published cultural content
    
- Search content
    
- Filter content
    
- Browse by province
    
- Browse by category
    
- Browse by tag
    
- Browse by content type
    
- View images
    
- Watch embedded YouTube videos
    
- View sources
    
- View public comments and replies
    
- Register or log in
    

A visitor cannot:

- Create content
    
- Write comments and replies
    
- Suggest corrections
    
- Submit reports
    

## 6.2 User

Every registered account receives the `USER` role.

A user can:

- Manage a personal profile
    
- Create cultural content
    
- Save drafts
    
- Edit personal drafts
    
- Upload images
    
- Add YouTube links
    
- Add sources
    
- Submit content for review
    
- View submission status
    
- Read moderator feedback
    
- Edit and resubmit returned content
    
- Write public comments and replies
    
- Suggest corrections
    
- Report content
    
- View the status of personal corrections and reports
    

There will be no separate contributor role. Every registered user can contribute.

## 6.3 Moderator

A moderator combines content-review and community-moderation responsibilities.

A moderator can:

- Perform all normal user actions
    
- View pending submissions
    
- Approve submissions
    
- Request changes
    
- Reject submissions
    
- Review revised submissions
    
- Examine sources and images
    
- Validate YouTube links
    
- Review correction suggestions
    
- Accept or reject corrections
    
- Handle reports
    
- Hide inappropriate content
    
- Hide inappropriate comments
    
- View content versions
    
- View limited audit information
    

A moderator cannot approve their own submission.

## 6.4 Administrator

An administrator can perform all moderator actions and can also:

- Manage users
    
- Assign or remove moderator roles
    
- Suspend or reactivate accounts
    
- Manage provinces
    
- Manage categories
    
- Manage tags
    
- Manage content types
    
- View all content
    
- Archive or restore content
    
- Manage report reasons
    
- Manage featured content
    
- View full audit logs
    
- View platform statistics
    
- Override moderation decisions when necessary
    

## 6.5 Final role list

```text
USER
MODERATOR
ADMIN
```

---

# 7. Permission Matrix

|Action|Visitor|User|Moderator|Admin|
|---|--:|--:|--:|--:|
|View published content|Yes|Yes|Yes|Yes|
|Search and filter|Yes|Yes|Yes|Yes|
|Watch YouTube videos|Yes|Yes|Yes|Yes|
|Create cultural content|No|Yes|Yes|Yes|
|Save drafts|No|Yes|Yes|Yes|
|Submit content|No|Yes|Yes|Yes|
|Write comments and replies|No|Yes|Yes|Yes|
|Suggest corrections|No|Yes|Yes|Yes|
|Report content|No|Yes|Yes|Yes|
|Review submissions|No|No|Yes|Yes|
|Approve or reject submissions|No|No|Yes|Yes|
|Handle correction suggestions|No|No|Yes|Yes|
|Handle reports|No|No|Yes|Yes|
|Hide inappropriate content|No|No|Yes|Yes|
|Manage users|No|No|No|Yes|
|Manage provinces and categories|No|No|No|Yes|
|Assign moderator roles|No|No|No|Yes|
|View full audit logs|No|No|No|Yes|

---

# 8. Cultural Content Model

The main information object in the system will be called a **Cultural Entry**.

A Cultural Entry contains one piece of organized Afghan cultural information.

## 8.1 Initial content types

The first version should support these content types:

1. **Cultural Article**
    
2. **Cultural Story or Oral History**
    
3. **Tradition or Custom**
    
4. **Cultural or Historical Place**
    
5. **Cultural Practice**
    

Images and YouTube videos will be attached to these entries rather than being separate content types.

Additional content types may later be added by the administrator.

## 8.2 Possible cultural categories

Categories may include:

- Traditions and customs
    
- Historical places
    
- Food
    
- Clothing
    
- Handicrafts
    
- Music
    
- Poetry and literature
    
- Oral stories
    
- Festivals and ceremonies
    
- Languages and expressions
    
- Architecture
    
- Cultural objects
    
- Local games
    
- Traditional occupations
    

Categories will be managed by the administrator.

---

# 9. Cultural Entry Fields

## 9.1 Required fields

Every submitted Cultural Entry must contain:

- Title
    
- Short summary
    
- Main content
    
- Content type
    
- Province
    
- Category
    
- Contributor
    
- Status
    
- Creation date
    
- Last update date
    

## 9.2 Optional fields

A Cultural Entry may contain:

- District
    
- Village or specific location
    
- Tags
    
- Images
    
- YouTube video link
    
- YouTube video description
    
- Sources or references
    
- Historical period
    
- Cultural community
    
- Alternative local name
    
- Related Cultural Entries

- Manual internal links to other published Cultural Entries
    
- Notes about regional differences

## 9.3 Internal Cultural Entry links

Version one will support Wikipedia-style internal links between Cultural Entries.

A contributor may manually select text inside the Tiptap editor and link that selected text to another existing `PUBLISHED` Cultural Entry. The selected text becomes the visible anchor text. The stored link must reference the target Cultural Entry by ID so it does not depend on a slug that may change for administrative reasons before publication. Normalized content files may use a stable internal `targetKey` before database import, but public reader URLs use the entry’s Persian slug.

Internal links should use descriptive anchor text and should not be repeated excessively within the same entry. Moderators may review or remove incorrect internal links during moderation. If a target entry later becomes unavailable, hidden, or archived, the public page must handle the reference safely instead of creating a broken reading experience.

Automatic keyword detection, automatic link suggestions, link analytics, incoming/outgoing link lists, related-entry discovery, and orphan-entry discovery are deferred to later versions.
    

## 9.4 Source fields

A source may contain:

- Source type
    
- Source title
    
- Author or information provider
    
- Publication date
    
- Website URL
    
- Book or article details
    
- Interviewed person
    
- Interview date
    
- Additional explanation
    

Possible source types:

- Book
    
- Academic article
    
- Website
    
- Archive
    
- Interview
    
- Oral source
    
- Personal experience
    
- Museum or institution
    
- Other
    

Oral stories and personal memories may not have written references. In such cases, the contributor must identify the source type clearly.

---

# 10. Image Requirements

Users may upload images for Cultural Entries.

Each image should contain:

- Image file
    
- Caption
    
- Alternative text
    
- Ownership or permission confirmation
    
- Optional photographer or source
    
- Display order
    

The system shall:

- Accept only approved image formats.
    
- Limit file size.
    
- Limit the number of images per entry.
    
- Validate the actual file type.
    
- Create optimized versions or thumbnails.
    
- Prevent unsupported files from being uploaded.
    
- Allow moderators to remove one image without deleting the full Cultural Entry.
    

Images should not be published when their copyright, permission, or privacy status is clearly problematic.

---

# 11. YouTube Video Requirements

The first version will not allow direct video uploads.

A user may attach a video only by providing a YouTube link.

The system shall:

- Accept supported YouTube URL formats.
    
- Validate that the entered link belongs to YouTube.
    
- Extract the YouTube video identifier.
    
- Store the link or video identifier.
    
- Display the video using an embedded YouTube player.
    
- Allow an optional video title.
    
- Allow an optional video description.
    
- Allow the moderator to remove an invalid or inappropriate link.
    

The system will not download or store the YouTube video.

The contributor must confirm that the video is relevant to the Cultural Entry and does not knowingly violate platform rules.

If a YouTube video is removed from YouTube, the platform should show a clear unavailable-video message without breaking the Cultural Entry page.

---

# 12. Content Statuses

|Status|Meaning|
|---|---|
|Draft|Saved by the user but not submitted|
|Pending Review|Submitted and waiting for a moderator|
|Under Review|Currently being examined|
|Changes Requested|Moderator requires corrections|
|Resubmitted|Contributor submitted a corrected version|
|Approved|Accepted by the moderator|
|Published|Publicly visible|
|Rejected|Not accepted|
|Hidden|Temporarily unavailable due to moderation|
|Archived|Preserved but no longer publicly active|
|Removed|Removed according to platform policy|

For the first version, approval may immediately publish the content. `Approved` and `Published` can still remain separate internally to support future improvements.

---

# 13. Functional Requirements

## 13.1 Registration and Authentication

**FR-AUTH-01:** A visitor shall be able to register using a name, email address, and password.

**FR-AUTH-02:** The system shall prevent duplicate email registration.

**FR-AUTH-03:** A registered user shall be able to log in.

**FR-AUTH-04:** A logged-in user shall be able to log out.

**FR-AUTH-05:** A user shall be able to request a password reset.

**FR-AUTH-06:** Password-reset links or tokens shall expire.

**FR-AUTH-07:** A logged-in user shall be able to change their password.

**FR-AUTH-08:** Protected actions shall be checked according to the user’s role.

**FR-AUTH-09:** An administrator shall be able to suspend or reactivate an account.

**FR-AUTH-10:** Important authentication and account actions shall be recorded.

Email verification may be included when time permits, but it should not block initial development.

---

## 13.2 User Profile

**FR-PRO-01:** Every registered user shall have a profile.

**FR-PRO-02:** A profile may contain:

- Display name
    
- Profile image
    
- Short biography
    
- Province
    
- Cultural interests
    

**FR-PRO-03:** Users shall be able to update their profiles.

**FR-PRO-04:** Users shall be able to view their own Cultural Entries.

**FR-PRO-05:** Users shall be able to view their entries grouped by status.

**FR-PRO-06:** Users shall be able to view their correction suggestions.

**FR-PRO-07:** Users shall be able to view their submitted reports.

Private information such as email addresses shall not be publicly displayed.

---

## 13.3 Content Creation

**FR-CON-01:** A user shall be able to create a Cultural Entry.

**FR-CON-02:** A user shall select a content type.

**FR-CON-03:** A user shall enter a title, summary, and main content.

**FR-CON-04:** A user shall select a geographic scope: one specific province, Afghanistan-wide, or no meaningful geographic dependency. Province selection is required only for province-scoped entries.

**FR-CON-05:** A user shall select a category.

**FR-CON-06:** A user may add a district or location only when the entry is province-scoped.

**FR-CON-07:** A user may add tags.

**FR-CON-08:** A user may add one or more sources.

**FR-CON-09:** A user may upload images.

**FR-CON-10:** A user may attach one or more supported YouTube links.

**FR-CON-11:** A user shall be able to save the content as a draft.

**FR-CON-12:** A user shall be able to edit or delete a personal draft.

**FR-CON-13:** A user shall be able to preview content before submission.

**FR-CON-14:** The system shall validate required fields before submission.

**FR-CON-15:** A user shall confirm compliance with contribution, copyright, and cultural-respect rules.

**FR-CON-16:** Published Cultural Entries shall receive readable permanent URLs.

**FR-CON-17:** A contributor may manually link selected Tiptap text to another existing published Cultural Entry.

**FR-CON-18:** Internal Cultural Entry links shall store the target entry ID as the authoritative reference.

**FR-CON-19:** The system shall prevent an entry from linking to itself.

---

## 13.4 Submission and Moderation

**FR-MOD-01:** A user shall be able to submit a completed draft.

**FR-MOD-02:** The status shall change to `Pending Review`.

**FR-MOD-03:** Submitted content shall not be publicly visible.

**FR-MOD-04:** A moderator shall be able to open a pending submission.

**FR-MOD-05:** A moderator shall be able to review:

- Main content
    
- Province
    
- Category
    
- Tags
    
- Sources
    
- Images
    
- YouTube links
    

**FR-MOD-06:** A moderator shall be able to approve the submission.

**FR-MOD-07:** A moderator shall be able to request changes.

**FR-MOD-08:** A moderator shall be able to reject the submission.

**FR-MOD-09:** A reason shall be required when requesting changes or rejecting content.

**FR-MOD-10:** The user shall see the decision and moderator comments in their dashboard.

**FR-MOD-11:** A user shall be able to edit content when changes are requested.

**FR-MOD-12:** A user shall be able to resubmit corrected content.

**FR-MOD-13:** The moderator shall be able to compare previous and revised versions.

**FR-MOD-14:** An approved entry shall become publicly available.

**FR-MOD-15:** The system shall record the moderator, decision, date, and comments.

**FR-MOD-16:** A moderator shall not approve their own contribution.

---

## 13.5 Public Browsing

**FR-BRW-01:** Visitors shall be able to view published Cultural Entries.

**FR-BRW-02:** The home page shall show selected, recent, or featured content.

**FR-BRW-03:** Visitors shall be able to browse by province for province-scoped Cultural Entries and filter national entries separately.

**FR-BRW-04:** Visitors shall be able to browse by category.

**FR-BRW-05:** Visitors shall be able to browse by content type.

**FR-BRW-06:** Visitors shall be able to browse by tag.

**FR-BRW-07:** Every published Cultural Entry shall have a detail page.

**FR-BRW-08:** The detail page shall show:

- Title
    
- Summary
    
- Main content
    
- Province
    
- Category
    
- Content type
    
- Tags
    
- Images
    
- YouTube videos
    
- Sources
    
- Contributor display name
    
- Publication date
    
- Review status
    

**FR-BRW-09:** The page should show related content.

**FR-BRW-10:** Users shall be able to copy or share the page link.

**FR-BRW-11:** Published entry pages shall render approved internal Cultural Entry links safely.

**FR-BRW-12:** If a linked target entry is unavailable, hidden, or archived, the page shall avoid a broken user experience.

---

## 13.6 Search and Filtering

**FR-SRC-01:** Visitors shall be able to search published content using Persian keywords.

**FR-SRC-02:** Search shall include:

- Titles
    
- Summaries
    
- Main content
    
- Tags
    
- Categories
    
- Provinces
    
- Locations
    

**FR-SRC-03:** Users shall be able to filter by province for province-scoped Cultural Entries and by geographic scope for national or non-geographic entries.

**FR-SRC-04:** Users shall be able to filter by category.

**FR-SRC-05:** Users shall be able to filter by content type.

**FR-SRC-06:** Users shall be able to filter by tag.

**FR-SRC-07:** Users shall be able to combine filters.

**FR-SRC-08:** Search results may be sorted by:

- Relevance
    
- Newest
    
- Oldest
    
- Most viewed
    
**FR-SRC-09:** Visitors shall see only published content.

**FR-SRC-10:** The system shall show a clear Persian message when no results are found.

**FR-SRC-11:** Persian text shall be normalized before searching.

---

## 13.7 Entry Comments

**FR-COM-01:** An authenticated, active, email-verified user shall be able to write multiple comments on a published Cultural Entry.

**FR-COM-02:** A user shall be able to reply to any active comment, including their own, with no fixed nesting-depth limit.

**FR-COM-03:** A user shall be able to edit or soft-delete any of their own active comments.

**FR-COM-04:** Active comments shall display safe author information, entry-author status, dates, like count, and direct reply count.

**FR-COM-05:** Comment bodies shall contain 5–1000 normalized characters.

**FR-COM-06:** A verified user shall be able to like or unlike an active comment once, but shall not like their own comment.

**FR-COM-07:** Root comments shall support newest, oldest, and most-liked ordering; direct replies shall use oldest-first ordering and offset pagination.

**FR-COM-08:** A moderator shall be able to hide an inappropriate comment through the existing report system.

**FR-COM-09:** Hidden or deleted comments shall appear as body- and author-free tombstones only when needed to preserve a path to visible descendants; inactive leaves shall be omitted.

**FR-COM-10:** Comments shall not be treated as formal corrections. Users identifying factual problems should use the correction-suggestion form.

---

## 13.8 Correction Suggestions

**FR-COR-01:** A registered user shall be able to suggest a correction.

**FR-COR-02:** The correction form shall ask the user to identify the incorrect or incomplete section.

**FR-COR-03:** The user shall provide the proposed correction.

**FR-COR-04:** The user shall provide a reason.

**FR-COR-05:** The user may provide a source.

**FR-COR-06:** A correction shall not immediately modify published content.

**FR-COR-07:** A moderator shall review the correction.

**FR-COR-08:** A moderator shall be able to accept or reject the correction.

**FR-COR-09:** An accepted correction shall create a new content version.

**FR-COR-10:** The previous version shall remain preserved.

**FR-COR-11:** The user shall be able to see the decision in their dashboard.

---

## 13.9 Reports

**FR-REP-01:** A registered user shall be able to report published content.

**FR-REP-02:** Report reasons shall include:

- Inaccurate information
    
- Offensive or discriminatory content
    
- Copyright problem
    
- Privacy problem
    
- Incorrect province or category
    
- Duplicate content
    
- Missing or misleading source
    
- Culturally sensitive content
    
- Invalid YouTube link
    
- Spam
    
- Other
    

**FR-REP-03:** A user shall provide an explanation.

**FR-REP-04:** Reports shall not be publicly displayed.

**FR-REP-05:** A moderator shall be able to review reports.

**FR-REP-06:** A moderator shall be able to:

- Dismiss the report
    
- Hide the content
    
- Request corrections
    
- Remove an image
    
- Remove a YouTube link
    
- Archive the content
    
- Escalate the issue to an administrator
    

**FR-REP-07:** Serious content may be hidden during investigation.

**FR-REP-08:** The system shall record the report decision.

**FR-REP-09:** The reporting user shall see the status in their dashboard.

---

## 13.10 Administration

**FR-ADM-01:** The administrator shall have a protected dashboard.

**FR-ADM-02:** The administrator shall be able to view users.

**FR-ADM-03:** The administrator shall be able to assign moderator roles.

**FR-ADM-04:** The administrator shall be able to suspend users.

**FR-ADM-05:** The administrator shall be able to edit, reorder, enable, and disable the fixed seeded
province taxonomy. Each province supports a public description, one optional managed image, usage
counts, and nested district management. Provinces and districts are never physically deleted while
they may be referenced by Cultural Entries.

**FR-ADM-06:** The administrator shall be able to manage categories.

**FR-ADM-07:** The administrator shall be able to manage tags.

**FR-ADM-08:** The administrator shall be able to manage content types.

**FR-ADM-09:** The administrator shall be able to view all Cultural Entries.

**FR-ADM-10:** The administrator shall be able to archive and restore content.

Archiving is allowed only for published content and restoration returns only previously published archived content to `PUBLISHED`. Both actions require a reason, create moderation and audit history, and preserve the original publication timestamp and content versions.

**FR-ADM-11:** The administrator shall be able to manage featured content.

**FR-ADM-12:** The administrator shall be able to manage report reasons.

**FR-ADM-13:** The administrator shall be able to view audit logs.

**FR-ADM-14:** The administrator shall be able to view basic statistics.

---

# 14. User Dashboard

The user dashboard should contain:

- My profile
    
- Create Cultural Entry
    
- Drafts
    
- Pending submissions
    
- Entries under review
    
- Changes requested
    
- Approved and published entries
    
- Rejected entries
    
- My correction suggestions
    
- My reports
    
- My comments and replies
    

There will be no notification centre.

Users will check the current status directly from the dashboard.

---

# 15. Moderator Dashboard

The moderator dashboard should contain:

- Pending submissions
    
- Submissions under review
    
- Resubmitted content
    
- Correction suggestions
    
- Open reports
    
- Hidden content
    
- Hidden comments
    
- Recently completed moderation actions
    

The dashboard should allow filtering by:

- Status
    
- Province
    
- Category
    
- Content type
    
- Submission date
    

---

# 16. Administrator Dashboard

The administrator dashboard should contain:

- Total users
    
- Total moderators
    
- Total Cultural Entries
    
- Pending submissions
    
- Published content
    
- Rejected content
    
- Open reports
    
- Correction suggestions
    
- Content by province
    
- Content by category
    
- User management
    
- Province management
    
- Category management
    
- Tag management
    
- Content-type management
    
- Audit logs
    

---

# 17. Main Product Flows

## 17.1 Public Discovery Flow

```text
Visitor opens platform
        ↓
Views home page
        ↓
Searches or chooses province, category, tag, or content type
        ↓
Views results
        ↓
Opens Cultural Entry
        ↓
Reads content
        ↓
Views images and embedded YouTube videos
        ↓
Checks sources and related content
```

## 17.2 Registration Flow

```text
Visitor selects Register
        ↓
Enters name, email, and password
        ↓
Accepts platform rules
        ↓
System validates information
        ↓
Account is created
        ↓
User logs in
        ↓
User may complete profile
```

## 17.3 Contribution Flow

```text
User selects Create Content
        ↓
Selects content type
        ↓
Enters title, summary, and main content
        ↓
Selects province and category
        ↓
Adds tags and optional location
        ↓
Adds sources
        ↓
Uploads images
        ↓
Adds optional YouTube link
        ↓
Saves draft
        ↓
Previews content
        ↓
Submits for review
        ↓
Status becomes Pending Review
```

## 17.4 Moderation Flow

```text
Moderator opens pending submission
        ↓
Checks content, sources, images, province, category, and YouTube links
        ↓
Chooses one decision
```

### Approval

```text
Moderator approves
        ↓
Decision is recorded
        ↓
Content is published
        ↓
User sees Published status in dashboard
```

### Changes requested

```text
Moderator requests changes
        ↓
Moderator writes required corrections
        ↓
User sees feedback in dashboard
        ↓
User edits content
        ↓
User resubmits
        ↓
Moderator reviews revised version
```

### Rejection

```text
Moderator rejects content
        ↓
Moderator provides reason
        ↓
Content remains private
        ↓
User sees Rejected status and reason
```

## 17.5 Correction Flow

```text
User opens published Cultural Entry
        ↓
Selects Suggest Correction
        ↓
Identifies the problem
        ↓
Provides correction, reason, and optional source
        ↓
Submits suggestion
        ↓
Moderator reviews it
        ↓
Moderator accepts or rejects it
```

When accepted:

```text
New content version is created
        ↓
Published entry is updated
        ↓
Previous version is preserved
        ↓
Correction status becomes Accepted
```

## 17.6 Report Flow

```text
User opens published content
        ↓
Selects Report
        ↓
Chooses a reason
        ↓
Writes an explanation
        ↓
Submits report
        ↓
Moderator investigates
        ↓
Moderator dismisses, hides, corrects, archives, or escalates content
        ↓
User sees report status in dashboard
```

## 17.7 Entry Comment Flow

```text
User opens published content
        ↓
Writes a comment or reply
        ↓
Comment appears publicly
        ↓
Readers may like or report it; moderators may hide comments that violate rules
```

---

# 18. Main Data Entities

| Entity                | Purpose                                            |
| --------------------- | -------------------------------------------------- |
| User                  | Account, profile, and role                         |
| Cultural Entry        | Main cultural content                              |
| Content Version       | Stores previous content versions                   |
| Content Type          | Article, story, tradition, place, or practice      |
| Province              | Geographic classification                          |
| District              | Optional detailed location                         |
| Category              | Cultural classification                            |
| Tag                   | Flexible topic label                               |
| Image                 | Uploaded image metadata                            |
| YouTube Video         | YouTube link and description                       |
| Source                | Reference or information source                    |
| Moderation Review     | Approval, rejection, or changes-requested decision |
| Correction Suggestion | Proposed correction                                |
| Public Review         | Public user comment                                |
| Report                | Content or policy complaint                        |
| Audit Log             | Important system activity                          |


    

---

# 19. Business Rules

1. Only published Cultural Entries are visible to visitors.
    
2. Every registered user may create content.
    
3. Users cannot directly publish their own content.
    
4. A moderator cannot approve their own submission.
    
5. A reason is required for rejection or requested changes.
    
6. Content under review cannot be changed without returning it to the contributor.
    
7. Accepted corrections create a new content version.
    
8. Previous versions must remain available to moderators and administrators.
    
9. Entry comments do not directly change Cultural Entries.
    
10. Reports do not automatically remove content.
    
11. Serious reports may temporarily hide content.
    
12. Images require ownership or permission confirmation.
    
13. Videos are accepted only through valid YouTube links.
    
14. A removed YouTube video must not break the Cultural Entry page.
    
15. Cultural stories may use oral or personal sources.
    
16. Oral history should be labeled as oral history, not automatically presented as established historical fact.
    
18. Different regional interpretations may coexist when appropriate.

19. Internal Cultural Entry links are manually created in version one.

20. Only published Cultural Entries may be selected as internal-link targets.

21. Internal links must use descriptive anchor text and avoid excessive repetition.
    
19. Every important moderation action must be traceable.
    
20. Private user information must not be shown publicly.
    
21. All public interface content must be displayed correctly in right-to-left format.
    
22. Hidden, rejected, or archived content must not appear in public search results.
    

---

# 20. Non-Functional Requirements

## 20.1 Usability

- The interface shall be simple for non-technical users.
    
- Forms shall use clear Persian labels.
    
- Validation errors shall be shown in simple Persian.
    
- Navigation shall remain consistent.
    
- Users should be warned before leaving unsaved content.
    
- The design shall work on desktop, tablet, and mobile screens.
    

## 20.2 Persian and Right-to-Left Support

- The complete interface shall use right-to-left layout.
    
- Persian fonts must remain readable on common devices.
    
- Form fields shall support Persian text correctly.
    
- Search shall normalize common Persian and Arabic characters.
    
- Dates may be displayed in the Persian calendar where appropriate.
    
- Numbers should be presented consistently.
    

## 20.3 Accessibility

- Images shall support alternative text.
    
- Forms shall have proper labels.
    
- Keyboard navigation should be supported.
    
- Text and background contrast shall be readable.
    
- Buttons shall have clear names.
    
- YouTube videos should support available captions.
    

## 20.4 Performance

- Public pages should load efficiently on normal mobile connections.
    
- Images shall be optimized.
    
- YouTube videos should not load heavily before the user interacts with them where possible.
    
- Search results should normally load within a few seconds.
    
- Large images shall not block page loading.
    
- Public content may be cached.
    

## 20.5 Security

- Passwords must not be stored as plain text.
    
- Protected actions must be checked by the backend.
    
- Role restrictions must be enforced on the server.
    
- Login endpoints must be protected against repeated abuse.
    
- Uploaded images must be validated.
    
- User content must be protected against common web attacks.
    
- Password-reset tokens must expire.
    
- Important administrative and moderation actions must be logged.
    
- Suspended users must not perform protected actions.
    

## 20.6 Privacy

- Only necessary personal data shall be collected.
    
- Email addresses shall not be public.
    
- Reports shall remain private.
    
- Users shall control basic public profile information.
    
- Personal contact details shall not be exposed.
    
- Account-deletion requests should be supported according to platform policy.
    

## 20.7 Reliability

- Database backups shall be created.
    
- Image files shall use reliable storage.
    
- Failed uploads shall not create broken Cultural Entries.
    
- The system shall prevent accidental repeated submissions.
    
- Important errors shall be logged.
    
- Published entries shall not disappear because of temporary service errors.
    

## 20.8 Maintainability

- Main product modules shall remain separate.
    
- Content statuses shall be centrally defined.
    
- Validation rules should be reusable.
    
- Critical workflows should have automated tests.
    
- Administrative and moderation actions should be documented.
    
- The product should support adding more languages and roles in future versions without complete redevelopment.
    

## 20.9 Search-Engine Visibility

- Published content shall use readable URLs.
    
- Public pages shall have meaningful titles and descriptions.
    
- Public Cultural Entries should be understandable to search engines.
    
- Private and rejected content shall not be indexed.
    
- Images should include descriptive alternative text.
    

---

# 21. Content Policy Requirements

The platform should define rules for:

- Respectful cultural representation
    
- False or misleading information
    
- Hate speech
    
- Discrimination
    
- Political propaganda
    
- Religious sensitivity
    
- Private or sacred knowledge
    
- Copyright
    
- Personal photographs
    
- Consent
    
- Information about children
    
- Duplicate content
    
- Copied content
    
- Spam
    
- Dangerous or vulnerable cultural-site locations
    
- Illicit cultural objects
    
- Community correction requests
    

Content may be identified as:

- Documented information
    
- Oral history
    
- Personal memory
    
- Community account
    
- Local tradition
    
- Disputed interpretation
    
- Unverified contribution
    

This helps avoid presenting every contribution as an established historical fact.

---

# 22. Basic Analytics

Administrators should be able to see:

- Total users
    
- Total moderators
    
- Total Cultural Entries
    
- Total published entries
    
- Pending review count
    
- Changes-requested count
    
- Rejected count
    
- Content by province
    
- Content by category
    
- Content by type
    
- Open reports
    
- Submitted corrections
    
- Accepted corrections
    
- Most-viewed content
    
- Average moderation time
    
- Common search terms
    
- Searches with no results
    

These statistics may also support the Results and Discussion chapters of the monograph.

---

# 23. MVP Acceptance Criteria

The first version will be considered complete when:

1. A visitor can register and log in.
    
2. A user can create a Cultural Entry.
    
3. A user can save a draft.
    
4. A user can add province, category, tags, and sources.
    
5. A user can upload images.
    
6. A user can add a valid YouTube link.
    
7. A user can submit content for review.
    
8. A moderator can approve, reject, or request changes.
    
9. A user can revise and resubmit returned content.
    
10. Approved content becomes publicly visible.
    
11. Visitors can search published content in Persian.
    
12. Visitors can filter by province for province-scoped entries, by geographic scope for national/non-geographic entries, and by category, tag, and content type.
    
13. Users can write multiple comments and nested replies on published entries.
    
14. Users can suggest corrections.
    
15. Moderators can accept or reject corrections.
    
16. Users can report content.
    
17. Moderators can resolve reports.
    
19. Previous content versions are preserved.
    
20. Administrators can manage users, provinces, categories, tags, and content types.
    
21. Access restrictions are enforced by the backend.
    
22. The complete interface works correctly in Persian and right-to-left format.
    
23. The platform works correctly on desktop and mobile screens.
    

---

# 24. Future-Version Features

The following may be implemented later:

- Pashto and English interfaces
    
- Content translation
    
- Language filtering
    
- Direct video uploads
    
- Audio stories
    
- In-platform notifications
    
- Email notifications
    
- Interactive Afghanistan map
    
- Cultural-expert role
    
- Separate contributor role
    
- Advanced permissions
    
- Expert-reviewed badges
    
- Contributor reputation
    
- AI-assisted search
    
- Automatic tags
    
- Recommendation system
    
- Mobile application
    
- Institutional accounts
    
- Community campaigns
    
- Public data API
    
- Linked Open Data
    
- Restricted access for sensitive cultural material
    

---

# 25. Remaining Product Decisions

Before creating database and interface designs, the following details still need final confirmation:

1. Whether email verification is mandatory in the first version.
    
2. Maximum number of images allowed for each Cultural Entry.
    
3. Maximum size of each image.
    
4. Whether one Cultural Entry may contain multiple YouTube links or only one.
    
5. Whether comments should use pre-publication moderation in a future version; v1 publishes active comments immediately and uses report-driven moderation.
    
6. Whether the original contributor can request removal of published content.
    
7. Whether administrators can edit published content directly or must create a new version.
    
8. Whether approved content publishes immediately or requires final administrator confirmation.
    
9. Which exact content types and categories will be included at launch.
    

Districts are confirmed as Admin-managed records in v1. Free-text location remains available for
village or local detail that does not map to a managed district.

This updated document defines a realistic first version with a Persian-only interface, YouTube-link videos, no notification module, and three manageable roles: **User, Moderator, and Administrator**.
