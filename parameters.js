module.exports = () => require("yargs")
    .alias("a", "adress")
    .demandOption("a")
    .boolean("c")
    .alias("c", "copy")
    .describe("c", "Copy files to target directory")
    .implies("c","t")
    .boolean("r")
    .alias("r", "remove")
    .describe("r", "Remove source files")
    .implies("r","t")
    .boolean("l")
    .alias("l", "links")
    .describe("l", "Create links in place of source files")
    .implies("l","t")
    .boolean("u")
    .alias("u", "update")
    .describe("u", "Update mode - use database contents to scan for files missing on filesystem")
    .boolean("x")
    .alias("x", "skip-scan")
    .describe("x", "Disables scanning filesystem - usefull in conjunction with --update")
    .string("t")
    .alias("t", "target")
    .describe("t", "Target directory")
    .array("p")
    .alias("p", "paths")
    .describe("p", "Paths to scan")
    .demandOption("p")
    .help("h")
    .argv;