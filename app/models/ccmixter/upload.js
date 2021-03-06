import Model               from '../model';
import LicenseUtils        from '../licenses';
import { TagString }       from '../../unicorns';
import { UploadUserBasic } from './user' ;

const NOT_FOUND = -1;

class File extends Model {

  constructor() {
    super(...arguments);
    
    this.urlBinding      = 'download_url';
    this.idBinding       = 'file_id';
    this.sizeBinding     = 'file_filesize';
    this.typeBinding     = 'file_extra.type';
    this.uploadBinding   = '_bindParent';
    this.mediaURLBinding = 'download_url';

    this.getExtension = function() {
      return this.local_path.replace(/.*\.([a-z0-9]+)$/,'$1');
    };

    this.getNicName = function() {
      if( this.file_nicname !== this.getExtension() ) {
        return this.file_nicname;
      }
      return this.file_extra.type;
    };

    this.getTags = function() {
      if( 'ccud' in this.file_extra ) {
        return TagString.fromString( this.file_extra.ccud );
      }
      return '';
    };

    this.getIsMP3 = function() {
      var ffi = this.file_format_info;
      if( (ffi) && ('format-name' in ffi) ) {
        return ffi['format-name'] === 'audio-mp3-mp3';
      }
      return false;
    };

    this.getIsFLAC = function() {
      var ffi = this.file_format_info;
      if( (ffi) && ('format-name' in ffi) ) {
        return ffi['format-name'].match(/flac/) !== null;
      }
      return false;
    };

    this.getIsZIP = function() {
      var ffi = this.file_format_info;
      if( (ffi) && ('format-name' in ffi) ) {
        return ffi['format-name'].match(/zip/) !== null;
      }
      return false;
    };

    this.getZipContents = function() {
      var ffi = this.file_format_info;
      if( (ffi) && ('zipdir' in ffi) && ffi.zipdir ) {
        return ffi.zipdir.files.map( f => f || '' );
      }
      return null;
    };

    this.getWavImageURL = function() {
      var baseURL = 'http://ccmixter.org/waveimage/'; // um, hello ENV?
      return baseURL + this.file_upload + '/' + this.file_id;
    };

    this.getDownloadSize = function() {
      var sz = this.file_filesize;
      return sz ? sz.replace(/\(|\)|\s+/g, '') : '';
    };

    this.getPlayTime = function() {
      var ffi = this.file_format_info;
      if( (ffi) && ('ps' in ffi) ) {
        return ffi.ps;
      }
      return null;
    };

    this.getIsCCPlus = function() {
      if( this._bindParent.upload_tags ) {
        var uptags = TagString.fromString(this._bindParent.upload_tags);
        var mytags = this.getTags();
        return mytags && ( (uptags.contains('ccplus_stem') && mytags.contains('sample,acappella')) || uptags.contains('ccplus') );
      }
    };
    /* required by audio player */
    
    this.getMediaTags = function() {

      var id          = this._bindParent.upload_id;
      var name        = this._bindParent.upload_name;

      var fileID      = this.file_id;
      var wavImageURL = this.getWavImageURL();
      var artist      = {
                     name: this._bindParent.user_real_name,
                     id: this._bindParent.user_name
                   };

      return { name, id, fileID, artist, wavImageURL };

    };
  }

  _hasTag(tag) {
    var tags = this.getTags();
    if( tags ) {
      return tags.contains(tag);
    }
    return false;
  }

}


class UploadBasic extends Model {

  constructor() {
    super(...arguments);
    this.nameBinding = 'upload_name';
    this.urlBinding = 'file_page_url';
    this.idBinding = 'upload_id';
    this._modelSubtree = {
          artist: UploadUserBasic,
        };
  }

}

class Related  extends UploadBasic {

  constructor() {
    super(...arguments);

    this.getId = function() {
      if( this.upload_id )
        return this.upload_id;
      if( this.file_page_url ) {
        return this.file_page_url.match(/\/([\d]+)$/)[1];
      }
    };
  }
}

class RemixOf  extends Related { }

class Source extends Related { }

class TrackbackUser extends Model {
  constructor() {
    super(...arguments);
    this.nameBinding = '_bindParent.pool_item_artist';
  }
}

class Trackback extends Model {

  constructor() {
    super(...arguments);
    this._modelSubtree = {
        artist: TrackbackUser,
      };
    this.idBinding = 'pool_item_id';
    this.urlBinding = 'pool_item_url';
    this.embedBinding = 'pool_item_extra.embed';
    this.typeBinding = 'pool_item_extra.ttype';

    this.getName = function() {
      var name = this.pool_item_name + '';
      if( name.match(/^watch\?/) !== null ) {
        name = 'You Tube Video';
      }
      return name;
    };
      
  }
}

class Upload extends UploadBasic {

  constructor() {
    super(...arguments);

    this._modelSubtree = {
      files: File,
      artist: UploadUserBasic,
    };

    this.idBinding = 'upload_id';
    this.descriptionBinding = 'upload_description_plain';

    this.getMediaURL = function(target) {
      var f = this.getFileInfo(target);
      return (f && f.mediaURL) || this.fplay_url || this.download_url;
    };
  
    this.getMediaTags = function(target) {
      var f = this.getFileInfo(target);
      return f && f.mediaTags;
    };

    this.getBpm = function() {
      if( this.upload_extra ) {
        var bpm = this.upload_extra.bpm;
        bpm = (bpm + '').match(/^[0-9]+/);
        return (bpm && bpm[0]) || '';
      }
    };

    this.getFileInfo = function(target) {
      return this._findFileInfo( target, f => f.isMP3 );
    };

    this.getWavImageURL = function(target) {
      var f = this.getFileInfo(target);
      return f ? f.wavImageURL : '';
    };

    this.getDownloadSize = function(target) {
      var f = this.getFileInfo(target);
      return f ? f.size.replace(/\(|\)|\s+/g, '') : '';
    };

  }

  _findFileInfo(target,cb) {
    for( var i = 0; i < target.files.length; i++ ) {
      if( cb(target.files[i]) ) {
        return target.files[i];
      }
    }
  }


}

class ACappellaFile extends File {

  constructor() {
    super(...arguments);

    this.getIsPlayablePell = function() {
      return this.getIsMP3() && this._hasTag('acappella');
    };
  }
}

class ACappella extends Upload {

  constructor() {
    super(...arguments);
    this._modelSubtree = {
      files: ACappellaFile,
      artist: UploadUserBasic,
    };

    this.getFileInfo = function(target) {
      return this._findFileInfo( target, f => f.isPlayablePell ) ||
        this._findFileInfo( target, f => f.isMP3 && f.nicName && f.nicName.match(/(vocal|vox|pell)/) ) ||
        this._findFileInfo( target, f => f.isMP3 );
    };

  }
}


class SampleFile extends File {
  constructor() {
    super(...arguments);

    this.getIsPlayableSample = function() {
      return this.getIsMP3() || this.getIsFLAC();
    };

  }
}

class Sample extends Upload {
  constructor() {
    super(...arguments);
    this._modelSubtree = {
      files: SampleFile,
      artist: UploadUserBasic,
    };
    this.getUserTags = function() {
      return TagString.fromString( this.upload_extra.usertags );
    };    
  }
}


class DetailUploadUser extends UploadUserBasic {
  constructor() {
    super(...arguments);
    this.avatarURLBinding = '_bindParent.user_avatar_url';
  }
}

class Detail extends Upload {

  constructor() {
    super(...arguments);
    this._modelSubtree = {
      files: File,
      artist: DetailUploadUser,
    };

    this.numRecommendsBinding = 'upload_num_scores';
    this.dateBinding = 'upload_date_format';
    this.descriptionHTMLBinding = 'upload_description_html';

    this.getTags = function() {
      return TagString.fromString(this.upload_tags);
    };
    
    this.getUserTags = function() {
      return TagString.fromString( this.upload_extra.usertags );
    };
    
    this.getFeaturing = function() {
      var feat = this.upload_extra.featuring;
      return feat;
    };
    
    this.getNsfw = function() {
      return !!this.upload_extra.nsfw || false;
    };

    this.getEdPick = function() {
      if( this.upload_extra.edpicks ) {
        /*
          { edited: 2016-01-16 09:46:27,
            review: '',
            reviewer: '' }
        */
        return this.upload_extra.edpicks[ Object.keys(this.upload_extra.edpicks)[0] ];
      }
      return null;
    };

    this.setFeatureSources = function(sources) {
      if( !this.featuring && sources ) {
          var unique = [ ];
          // hello O(n)
          sources.forEach( f => {
            var name = f.artist.name;
            if( unique.indexOf(name) === NOT_FOUND ) {
              unique.push(name);
            }
          });
          this.featuring = unique.join(', ');
        }  
    };

    this.getNumReviews = function() {
      return this.upload_extra.num_reviews || 0;
    };

    // License stuff 
    
    this.licenseNameBinding = 'license_name';
    this.licenseURLBinding = 'license_url';
    
    this.getIsCCPlus = function() {
      return this._hasTag('ccplus') && (!this._hasTag('remix') || !this._hasTag('ccplus_stem'));
    };

    this.getIsOpen = function() {
      return this._hasTag('attribution,cczero,share_alike');
    };
    
    this.getIsSpecialLic = function() {
      return this._tagMatches(/^share_alike$/); 
    };

    this.getLicenseLogoURL = function() {
      return LicenseUtils.logoURLFromName( this.license_name );
    };
    
    this.getLicenseYear = function() {
      return this.year || (this.upload_date || this.upload_date_format).match(/(19|20)[0-9]{2}/)[0];
    };
    
    this.getPurchaseLicenseURL = function() {
      if( this.getIsCCPlus() ) {
        var baseURL = 'http://tunetrack.net/license/';
        return baseURL + this.file_page_url.replace('http://', '');
      }
    };

    this.getPurchaseLogoURL = function() {
      if( this.getIsCCPlus() ) {
        return LicenseUtils.logoURLFromAbbr( 'ccplus' );
      }
    };
    
  }

  _tagMatches(filter) {
    if( !this._tags ) {
      this._tags = this.getTags();
    }
    return this._tags.filter(filter).getLength() > 0;
  }

  _hasTag(tag) {
    if( !this._tags ) {
      this._tags = this.getTags();
    }
    return this._tags.contains(tag);
  }

}

module.exports = {
  ACappella, 
  Detail,
  RemixOf,
  Sample,
  Source,
  Trackback,
  Upload,
  UploadBasic,
};
