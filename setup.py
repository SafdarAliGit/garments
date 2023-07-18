from setuptools import setup, find_packages

with open('requirements.txt') as f:
	install_requires = f.read().strip().split('\n')

# get version from __version__ variable in garments/__init__.py
from garments import __version__ as version

setup(
	name='garments',
	version=version,
	description='Appp for Garments Industry',
	author='Unilink Enterprise',
	author_email='info@unilinkenterprise.com',
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
