var $path = require('path'),
    util = require('util'),
    HEADER_FILE_TYPE_SUFFIX = ".h",
    SOURCE_CODE_FILE_TYPE_PREFIX = "sourcecode.",
    M_EXTENSION = /[.]m$/, SOURCE_FILE = 'sourcecode.c.objc',
    C_EXTENSION = /[.]c$/, C_SOURCE_FILE = 'sourcecode.c.c',
    H_EXTENSION = /[.]h$/, HEADER_FILE = 'sourcecode.c.h',
    MM_EXTENSION = /[.]mm$/, MM_SOURCE_FILE = 'sourcecode.cpp.objcpp',
    HPP_EXTENSION = /[.](hpp|hxx|h\+\+|hh)$/, CPP_HEADER_FILE = 'sourcecode.cpp.h',
    CPP_EXTENSION = /[.](cpp|cxx|c\+\+|cc)$/, CPP_SOURCE_FILE = 'sourcecode.cpp.cpp',
    BUNDLE_EXTENSION = /[.]bundle$/, BUNDLE = '"wrapper.plug-in"',
    XIB_EXTENSION = /[.]xib$/, XIB_FILE = 'file.xib',
    DYLIB_EXTENSION = /[.]dylib$/, DYLIB = '"compiled.mach-o.dylib"',
    FRAMEWORK_EXTENSION = /[.]framework$/, FRAMEWORK = 'wrapper.framework',
    ARCHIVE_EXTENSION = /[.]a$/, ARCHIVE = 'archive.ar',
    PNG_EXTENSION = /[.]png/, PNG_IMAGE = "image.png",
    DEFAULT_SOURCE_TREE = '"<group>"',
    DEFAULT_FILE_ENCODING = 4;

function fileTypes() {
    return {
        SOURCE_FILE,
        C_SOURCE_FILE,
        HEADER_FILE,
        MM_SOURCE_FILE,
        CPP_HEADER_FILE,
        CPP_SOURCE_FILE,
        BUNDLE,
        XIB_FILE,
        FRAMEWORK,
        DYLIB,
        ARCHIVE,
        PNG_IMAGE,
    }
}

function isSourceOrHeaderFileType(fileType) {
    return fileType.startsWith(SOURCE_CODE_FILE_TYPE_PREFIX);
}

function isHeaderFileType(fileType) {
    return fileType.endsWith(HEADER_FILE_TYPE_SUFFIX);
}

function detectLastType(path) {
    if (M_EXTENSION.test(path))
        return SOURCE_FILE;

    if (C_EXTENSION.test(path))
        return C_SOURCE_FILE;

    if (H_EXTENSION.test(path))
        return HEADER_FILE;

    if (MM_EXTENSION.test(path))
        return MM_SOURCE_FILE;

    if (CPP_EXTENSION.test(path))
        return CPP_SOURCE_FILE;

    if (HPP_EXTENSION.test(path))
        return CPP_HEADER_FILE;

    if (BUNDLE_EXTENSION.test(path))
        return BUNDLE;

    if (XIB_EXTENSION.test(path))
        return XIB_FILE;

    if (FRAMEWORK_EXTENSION.test(path))
        return FRAMEWORK;

    if (DYLIB_EXTENSION.test(path))
        return DYLIB;

    if (ARCHIVE_EXTENSION.test(path))
        return ARCHIVE;

    if (PNG_EXTENSION.test(path))
        return PNG_IMAGE;

    // dunno
    return 'unknown';
}

function fileEncoding(file) {
    if (file.lastType != BUNDLE && file.lastType !== PNG_IMAGE &&  !file.customFramework) {
        return DEFAULT_FILE_ENCODING;
    }
}

function defaultSourceTree(file) {
    if (( file.lastType == DYLIB || file.lastType == FRAMEWORK ) && !file.customFramework) {
        return 'SDKROOT';
    } else {
        return DEFAULT_SOURCE_TREE;
    }
}

function correctPath(file, filepath) {
    if (file.lastType == FRAMEWORK && !file.customFramework) {
        return 'System/Library/Frameworks/' + filepath;
    } else if (file.lastType == DYLIB) {
        return 'usr/lib/' + filepath;
    } else {
        return filepath;
    }
}

function correctGroup(file) {
    if (isSourceOrHeaderFileType(file.lastType) && !isHeaderFileType(file.lastType)) {
        return 'Sources';
    } else if (file.lastType == DYLIB || file.lastType == ARCHIVE || file.lastType == FRAMEWORK) {
        return 'Frameworks';
    } else {
        return 'Resources';
    }
}

function pbxFile(filepath, opt) {
    var opt = opt || {};

    this.lastType = opt.lastType || detectLastType(filepath);

    // for custom frameworks
    if(opt.customFramework == true) {
      this.customFramework = true;
      this.dirname = $path.dirname(filepath);
    }

    this.basename = opt.basename || $path.basename(filepath);
    this.path = correctPath(this, filepath);
    this.group = correctGroup(this);

    this.sourceTree = opt.sourceTree || defaultSourceTree(this);
    this.fileEncoding = opt.fileEncoding || fileEncoding(this);

    if (opt.weak && opt.weak === true)
      this.settings = { ATTRIBUTES: ['Weak'] };

    if (opt.compilerFlags) {
        if (!this.settings)
          this.settings = {};
          this.settings.COMPILER_FLAGS = util.format('"%s"', opt.compilerFlags);
    }
}

module.exports = {
    pbxFile: pbxFile,
	fileTypes: fileTypes,
	isSourceOrHeaderFileType,
	isHeaderFileType,
}
