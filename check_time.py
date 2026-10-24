import os
from datetime import datetime
p='AYAS_Gameplay_Guide.pptx'
print(datetime.fromtimestamp(os.path.getmtime(p)))
