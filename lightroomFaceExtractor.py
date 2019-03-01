#!python2
import sys
import shutil
import os, os.path
import glob
import subprocess
from subprocess import check_output
from py_execute import run_command
import concurrent.futures

root_path = sys.argv[1]
path = root_path + '*.jpg'
processes = set()
faces_labelled_path = 'faces_labelled'

def ensure_dir(_dir_path):
  if not os.path.exists(_dir_path):
    os.makedirs(_dir_path)

def num_files_in_dir(_file_path):
  return len([item for item in os.listdir(_file_path)])

def analyze_exif(data):
  for line in data.splitlines():

    if "Region Name" in line:
      n = (line[line.index(":") + 2:].split(", "))
    if "Region Area H" in line:
      h = (line[line.index(":") + 2:].split(", "))
    if "Region Area W" in line:
      w = (line[line.index(":") + 2:].split(", "))
    if "Region Area X" in line:
      x = (line[line.index(":") + 2:].split(", "))
    if "Region Area Y" in line:
      y = (line[line.index(":") + 2:].split(", "))
    if "Image Width" in line:
      iw = float(line[line.index(":") + 2:])
    if "Image Height" in line:
      ih = float(line[line.index(":") + 2:])
  return n, h, w, x, y, iw, ih

def enumerate_task(n, h, w, x, y, iw, ih, file_path_o):
  for name_index, name in enumerate(n):
    # print(name)

    file_path = root_path + faces_labelled_path + '/' + name + '/'

    # create folder if doesn't exist
    ensure_dir(file_path)

    cropWidth = float(w[name_index]) * iw
    cropHeight = float(h[name_index]) * ih
    if cropWidth < 150 or cropHeight < 150:
      continue
    
    cropSize = max(cropWidth, cropHeight) * 1.3

    s1 = str(cropSize)
    s2 = 'x' + str(cropSize)
    s3 = '+' + str(float(x[name_index]) * iw - cropSize * 0.5)
    s4 = '+' + str(float(y[name_index]) * ih - cropSize * 0.5)
    s5 = ' -thumbnail 150x150 "' + file_path + name + '_' + str(num_files_in_dir(file_path)) + '.jpg"'

    cmd = 'convert "' + file_path_o + '" -crop ' + s1 + s2 + s3 + s4 + s5
    run_command.execute(cmd)

def task(data, file_path_o):
  n, h, w, x, y, iw, ih = analyze_exif(data)
  print(n)

  enumerate_task(n, h, w, x, y, iw, ih, file_path_o)

def get_exif(__file_path):
  # print('\nEXIF: ' + __file_path + '\n')
  task(subprocess.check_output(['exiftool', __file_path]), __file_path)

ensure_dir(root_path + faces_labelled_path)

executor = concurrent.futures.ThreadPoolExecutor(8)
futures = [executor.submit(get_exif, item) for item in glob.glob(path)]
concurrent.futures.wait(futures)

run_command.execute("find " + root_path + faces_labelled_path + " -mindepth 2 -type f -exec mv -i '{}' " + root_path + faces_labelled_path + " ';'")
run_command.execute("rm -rf " + root_path + faces_labelled_path + "/*/")