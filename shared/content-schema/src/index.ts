/**
 * @kodxcamp/content-schema — Zod schemas that validate the shape of every
 * file under /content. Used by the content build pipeline and by tests to
 * catch malformed courses before they ship to learners.
 */

export * from "./code.schema.js";
export * from "./course.schema.js";
export * from "./module.schema.js";
export * from "./item.schema.js";
export * from "./exercise.schema.js";
export * from "./quiz.schema.js";
export * from "./workshop.schema.js";
export * from "./assignment.schema.js";
export * from "./project.schema.js";
export * from "./roadmap.schema.js";
export * from "./landing.schema.js";
export * from "./legal.schema.js";
