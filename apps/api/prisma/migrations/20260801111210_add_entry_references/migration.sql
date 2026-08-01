-- CreateTable
CREATE TABLE "entry_references" (
    "id" UUID NOT NULL,
    "source_entry_id" UUID NOT NULL,
    "target_entry_id" UUID NOT NULL,
    "anchor_text" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entry_references_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "entry_references_source_entry_id_idx" ON "entry_references"("source_entry_id");

-- CreateIndex
CREATE INDEX "entry_references_target_entry_id_idx" ON "entry_references"("target_entry_id");

-- CreateIndex
CREATE INDEX "entry_references_source_entry_id_target_entry_id_idx" ON "entry_references"("source_entry_id", "target_entry_id");

-- CreateIndex
CREATE INDEX "entry_references_target_entry_id_created_at_idx" ON "entry_references"("target_entry_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "entry_references_source_entry_id_target_entry_id_anchor_tex_key" ON "entry_references"("source_entry_id", "target_entry_id", "anchor_text");

-- AddForeignKey
ALTER TABLE "entry_references" ADD CONSTRAINT "entry_references_source_entry_id_fkey" FOREIGN KEY ("source_entry_id") REFERENCES "cultural_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entry_references" ADD CONSTRAINT "entry_references_target_entry_id_fkey" FOREIGN KEY ("target_entry_id") REFERENCES "cultural_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
