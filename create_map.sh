#!/usr/bin/env bash

src1=$1
src2=$2
dest=$3


if [[ $# -lt 3 ]] ; then
	echo
	echo 'usage: ' $(basename "$0") ' [ pyradFile metaFile dest ]'
	exit 1
fi


create_pyradiomics_maps()
{
    # x = patch_x / patch_width and patch_y / patch_height
    awk -F ','  ' BEGIN{n=0;} {n++; if (n==1) print "i,j,TIL,Cancer,Tissue"; if (n>1) print int(($6-1)/$8)","int(($7-1)/$9)","int(255*$12)",0,0"}' $src1 > $dest
		awk -F ','  ' BEGIN{n=0;} {n++; if (n>1) print int(($2-1)/$8),int(($3-1)/$9);}' $src1
}
create_pyradiomics_maps


prepend_json_header()
{
    line=$(head -n 1 $src2)

    prepend() {
       printf '%s\n' H 1i "${1}" . wq | ed -s "${2}"
    }
    prepend "$line" "$dest" # || exit

}
prepend_json_header


# sort manually (temp)
open $dest
