# Image Organizer [![Build Status](https://travis-ci.org/AGrzes/image-organizer.svg?branch=develop)](https://travis-ci.org/AGrzes/image-organizer) [![Coverage Status](https://coveralls.io/repos/github/AGrzes/image-organizer/badge.svg?branch=develop)](https://coveralls.io/github/AGrzes/image-organizer?branch=develop)
Simple tool for for image indexing and organization.

The program scans the filesystem for image files and stores information about found images in CouchDB database. It identifies duplicate images using md5 sum and groups them together.

It can also 
* Copy files to target directory, organized by image creation date
* Remove source file - provided copy exist
* Place a link to target directory in place where source file was

## WARNING
This is still work in progress, use  at own risk.

## Dependencies
Image organizer requires [exiftool](http://www.sno.phy.queensu.ca/~phil/exiftool/) to analyze images.

## Usage
Install
```
npm install -g image-organizer
```

Run 

```
image-organizer <parameters>
```
### Parameters
| Short | Long | Type | Default | Description |
| --- | --- | --- | --- | --- |
| -a | --address | url | - | Database URL |
| -c | --copy | flag | false | Copy documents to destination |
| -r | --remove | flag | false | Remove Source Files |
|-l | --links | flag | false |  Create Source Links |
|-u | --update | flag | false | Update mode |
|-x | --skip-scan | flag | false | Disable Scan Mode |
|-t | --target | path | - | Target directory |
| -p | --paths | glob[] | - | Paths to scan |
| -m | --mime | pattern[] | ['image/**] | Mime types of files to process |
|-v | --verbose | flag* | 0 | Verbosity mode |
