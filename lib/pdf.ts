import { jsPDF } from "jspdf";
import { LectureData } from "@/types";

/**
 * Generates an academic-grade, professionally styled PDF using jsPDF.
 */
export function generateLecturePdf(lecture: LectureData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Helper to add headers and footers to every page
  const addHeaderFooter = (pageNo: number, totalPages: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    // Header
    doc.text("LectureLens — AI YouTube Study Companion", margin, 10);
    doc.text(new Date().toLocaleDateString(), pageWidth - margin, 10, { align: "right" });
    doc.setDrawColor(220, 225, 235);
    doc.setLineWidth(0.2);
    doc.line(margin, 12, pageWidth - margin, 12);

    // Footer
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.text("Generated with Sarvam AI & LectureLens", margin, pageHeight - 8);
    doc.text(`Page ${pageNo} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: "right" });
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 16) {
      doc.addPage();
      y = 18;
      return true;
    }
    return false;
  };

  // --- 1. COVER PAGE / HEADER BLOCK ---
  // Background badge
  doc.setFillColor(238, 242, 255); // Indigo-50
  doc.roundedRect(margin, y, contentWidth, 36, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(49, 46, 129); // Indigo-900
  const titleLines = doc.splitTextToSize(lecture.metadata.title, contentWidth - 10);
  doc.text(titleLines, margin + 5, y + 9);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(79, 70, 229); // Indigo-600
  doc.text(`Instructor / Channel: ${lecture.metadata.channelTitle}  •  Duration: ${lecture.metadata.durationFormatted}`, margin + 5, y + 25);
  doc.text(`Source: ${lecture.youtubeUrl}`, margin + 5, y + 31);

  y += 44;

  // --- 2. LECTURE OVERVIEW & PREREQUISITES ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text("Lecture Overview", margin, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  const overviewLines = doc.splitTextToSize(lecture.overview, contentWidth);
  doc.text(overviewLines, margin, y);
  y += overviewLines.length * 4.8 + 6;

  if (lecture.prerequisites && lecture.prerequisites.length > 0) {
    checkPageBreak(25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(30, 41, 59);
    doc.text("Prerequisites & Foundational Knowledge", margin, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    for (const prereq of lecture.prerequisites) {
      doc.text(`• ${prereq}`, margin + 3, y);
      y += 4.5;
    }
    y += 5;
  }

  // --- 3. TABLE OF CONTENTS ---
  checkPageBreak(35);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 8 + lecture.sections.length * 5, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59);
  doc.text("Table of Contents", margin + 4, y + 6);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  lecture.sections.forEach((sec, idx) => {
    doc.setTextColor(67, 56, 202);
    doc.text(`${idx + 1}. ${sec.title}`, margin + 6, y);
    doc.setTextColor(148, 163, 184);
    const startStr = `[Start: ${Math.floor(sec.youtubeStartTime / 60)}m ${sec.youtubeStartTime % 60}s]`;
    doc.text(startStr, pageWidth - margin - 6, y, { align: "right" });
    y += 5;
  });

  y += 8;

  // --- 4. TOPIC SECTIONS ---
  for (const sec of lecture.sections) {
    checkPageBreak(40);

    // Section Header Box
    doc.setFillColor(243, 244, 246);
    doc.rect(margin, y, contentWidth, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text(`${sec.title}`, margin + 3, y + 5.5);
    y += 12;

    for (const block of sec.blocks) {
      if (block.type === "heading") {
        continue; // Already printed
      }

      if (block.type === "paragraph") {
        const lines = doc.splitTextToSize(block.content.replace(/\*\*/g, ""), contentWidth);
        checkPageBreak(lines.length * 4.5 + 4);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(55, 65, 81);
        doc.text(lines, margin, y);
        y += lines.length * 4.5 + 4;
      } else if (block.type === "definition") {
        const lines = doc.splitTextToSize(block.content.replace(/\*\*/g, ""), contentWidth - 8);
        const boxHeight = lines.length * 4.5 + 8;
        checkPageBreak(boxHeight + 4);

        doc.setFillColor(254, 249, 195); // Amber-100
        doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(146, 64, 14); // Amber-800
        doc.text("CORE DEFINITION", margin + 4, y + 4.5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(69, 26, 3);
        doc.text(lines, margin + 4, y + 9);
        y += boxHeight + 4;
      } else if (block.type === "formula") {
        checkPageBreak(18);
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(margin, y, contentWidth, 14, 2, 2, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text("FORMULATION / DERIVATION", margin + 4, y + 4.5);

        doc.setFont("courier", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);
        doc.text(block.latex || block.content, margin + 4, y + 10);
        y += 18;
      } else if (block.type === "supplementary") {
        const text = block.content.replace(/\*\*/g, "");
        const lines = doc.splitTextToSize(text, contentWidth - 8);
        const citation = block.sourceCitation;
        const boxHeight = lines.length * 4.2 + (citation ? 14 : 8);
        checkPageBreak(boxHeight + 4);

        doc.setFillColor(240, 253, 244); // Green-50 / Emerald
        doc.setDrawColor(34, 197, 94);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(21, 128, 61); // Green-700
        doc.text("✦ SUPPLEMENTARY EXPLANATION (Web Enriched)", margin + 4, y + 4.5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(22, 101, 52);
        doc.text(lines, margin + 4, y + 9);

        if (citation) {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);
          doc.text(`Source: ${citation.title} (${citation.sourceName}) — ${citation.url}`, margin + 4, y + boxHeight - 3);
        }

        y += boxHeight + 4;
      } else if (block.type === "takeaway") {
        const lines = doc.splitTextToSize(block.content.replace(/\*\*/g, ""), contentWidth - 6);
        checkPageBreak(lines.length * 4.2 + 6);
        doc.setFillColor(238, 242, 255);
        doc.roundedRect(margin, y, contentWidth, lines.length * 4.2 + 6, 2, 2, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(67, 56, 202);
        doc.text(lines, margin + 4, y + 4.5);
        y += lines.length * 4.2 + 9;
      }
    }

    y += 4;
  }

  // --- 5. REVISION SHEET & PRACTICE QUESTIONS ---
  checkPageBreak(45);
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text("Executive Revision Sheet & Exam Summary", margin + 3, y + 5.5);
  y += 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text("Key Exam Tips:", margin, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  for (const tip of lecture.revisionSheet.examTips) {
    const tipLines = doc.splitTextToSize(`• ${tip}`, contentWidth);
    checkPageBreak(tipLines.length * 4.2);
    doc.text(tipLines, margin + 2, y);
    y += tipLines.length * 4.2 + 1;
  }
  y += 4;

  if (lecture.practiceQuestions && lecture.practiceQuestions.length > 0) {
    checkPageBreak(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text("Practice & Self-Assessment Questions:", margin, y);
    y += 6;

    lecture.practiceQuestions.forEach((pq, idx) => {
      checkPageBreak(25);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(`Q${idx + 1}: ${pq.question}`, margin + 2, y);
      y += 4.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(79, 70, 229);
      doc.text(`Ans: ${pq.answer}`, margin + 5, y);
      y += 4;

      doc.setTextColor(100, 116, 139);
      const expLines = doc.splitTextToSize(`Explanation: ${pq.explanation}`, contentWidth - 10);
      doc.text(expLines, margin + 5, y);
      y += expLines.length * 3.8 + 4;
    });
  }

  // Stamp headers and page numbers on all generated pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addHeaderFooter(i, totalPages);
  }

  return doc;
}

/**
 * Exports complete lecture notes as clean GitHub Markdown
 */
export function generateLectureMarkdown(lecture: LectureData): string {
  let md = `# ${lecture.metadata.title}\n\n`;
  md += `**Instructor / Channel:** ${lecture.metadata.channelTitle}  \n`;
  md += `**Source Video:** [Watch on YouTube](${lecture.youtubeUrl})  \n`;
  md += `**Duration:** ${lecture.metadata.durationFormatted}  \n`;
  md += `**Generated By:** LectureLens — AI YouTube Study Companion  \n\n`;
  md += `---\n\n`;

  md += `## Lecture Overview\n\n${lecture.overview}\n\n`;

  if (lecture.prerequisites && lecture.prerequisites.length > 0) {
    md += `### Prerequisites\n\n`;
    lecture.prerequisites.forEach((p) => {
      md += `- ${p}\n`;
    });
    md += `\n`;
  }

  md += `## Table of Contents\n\n`;
  lecture.sections.forEach((sec, idx) => {
    md += `${idx + 1}. [${sec.title}](#section-${idx + 1}) *(Starts at ${Math.floor(sec.youtubeStartTime / 60)}m ${sec.youtubeStartTime % 60}s)*\n`;
  });
  md += `\n---\n\n`;

  lecture.sections.forEach((sec, idx) => {
    md += `## Section ${idx + 1}: ${sec.title} {#section-${idx + 1}}\n\n`;
    md += `*Original Lecture Timestamp: [${Math.floor(sec.youtubeStartTime / 60)}:${(sec.youtubeStartTime % 60).toString().padStart(2, "0")}](${lecture.youtubeUrl}&t=${sec.youtubeStartTime}s)*\n\n`;

    sec.blocks.forEach((block) => {
      if (block.type === "paragraph") {
        md += `${block.content}\n\n`;
      } else if (block.type === "definition") {
        md += `> **Definition:** ${block.content}\n\n`;
      } else if (block.type === "formula") {
        md += `### Governing Equation\n\n$$\n${block.latex || block.content}\n$$\n\n`;
      } else if (block.type === "table") {
        md += `${block.content}\n\n`;
      } else if (block.type === "supplementary") {
        md += `> [!NOTE] **Supplementary Explanation (Web Enriched)**\n>\n`;
        md += `> ${block.content.replace(/\n/g, "\n> ")}\n`;
        if (block.sourceCitation) {
          md += `>\n> **Source:** [${block.sourceCitation.title}](${block.sourceCitation.url}) (${block.sourceCitation.sourceName})\n`;
        }
        md += `\n`;
      } else if (block.type === "takeaway") {
        md += `> **Key Takeaway:** ${block.content}\n\n`;
      }
    });

    md += `---\n\n`;
  });

  md += `## Executive Revision Sheet\n\n`;
  md += `### Core Exam Tips\n\n`;
  lecture.revisionSheet.examTips.forEach((tip) => {
    md += `- ${tip}\n`;
  });
  md += `\n`;

  if (lecture.practiceQuestions && lecture.practiceQuestions.length > 0) {
    md += `### Practice Questions & Self-Assessment\n\n`;
    lecture.practiceQuestions.forEach((q, i) => {
      md += `**Q${i + 1}: ${q.question}**\n\n`;
      md += `- **Answer:** ${q.answer}\n`;
      md += `- **Explanation:** ${q.explanation}\n\n`;
    });
  }

  return md;
}
