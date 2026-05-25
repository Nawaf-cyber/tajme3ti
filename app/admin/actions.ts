'use server';

import { prisma } from '../../lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addComponent(formData: FormData) {
  const categoryId = formData.get('categoryId') as string;
  const brand = formData.get('brand') as string;
  const name = formData.get('name') as string;
  const price = parseFloat(formData.get('price') as string);
  const tdpWattage = parseInt(formData.get('tdpWattage') as string);
  const specs = JSON.parse(formData.get('specs') as string);
  const description = formData.get('description') as string || null;
  const imageUrl = formData.get('imageUrl') as string || null;
  const amazonUrl = formData.get('amazonUrl') as string || null;
  const cazasouqUrl = formData.get('cazasouqUrl') as string || null;
  
  // معالجة آمنة لحقل مستوى الأداء
  const ptRaw = formData.get('performanceTier') as string;
  const performanceTier = (ptRaw && ptRaw.trim() !== '') ? parseInt(ptRaw, 10) : null;

  await prisma.component.create({
    data: { 
      categoryId, brand, name, price, tdpWattage, specs, description, imageUrl, amazonUrl, cazasouqUrl, performanceTier 
    }
  });

  revalidatePath('/admin');
  revalidatePath('/');
}

export async function updateComponent(formData: FormData) {
  const id = formData.get('id') as string;
  const categoryId = formData.get('categoryId') as string;
  const brand = formData.get('brand') as string;
  const name = formData.get('name') as string;
  const price = parseFloat(formData.get('price') as string);
  const tdpWattage = parseInt(formData.get('tdpWattage') as string);
  const specs = JSON.parse(formData.get('specs') as string);
  const description = formData.get('description') as string || null;
  const imageUrl = formData.get('imageUrl') as string || null;
  const amazonUrl = formData.get('amazonUrl') as string || null;
  const cazasouqUrl = formData.get('cazasouqUrl') as string || null;
  
  // معالجة آمنة لحقل مستوى الأداء
  const ptRaw = formData.get('performanceTier') as string;
  const performanceTier = (ptRaw && ptRaw.trim() !== '') ? parseInt(ptRaw, 10) : null;

  await prisma.component.update({
    where: { id },
    data: { 
      categoryId, brand, name, price, tdpWattage, specs, description, imageUrl, amazonUrl, cazasouqUrl, performanceTier 
    }
  });

  revalidatePath('/admin');
  revalidatePath('/');
}

export async function deleteComponent(formData: FormData) {
  const id = formData.get('id') as string;
  await prisma.component.delete({ where: { id } });
  revalidatePath('/admin');
  revalidatePath('/');
}

export async function addNews(formData: FormData) {
  const title = formData.get('title') as string;
  const summary = formData.get('summary') as string;
  const content = formData.get('content') as string;
  const category = formData.get('category') as string;
  const imageUrl = formData.get('imageUrl') as string || null;

  await prisma.news.create({
    data: { title, summary, content, category, imageUrl }
  });

  revalidatePath('/admin');
  revalidatePath('/news');
}

export async function updateNews(formData: FormData) {
  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const summary = formData.get('summary') as string;
  const content = formData.get('content') as string;
  const category = formData.get('category') as string;
  const imageUrl = formData.get('imageUrl') as string || null;

  await prisma.news.update({
    where: { id },
    data: { title, summary, content, category, imageUrl }
  });

  revalidatePath('/admin');
  revalidatePath('/news');
}

export async function deleteNews(formData: FormData) {
  const id = formData.get('id') as string;
  await prisma.news.delete({ where: { id } });
  revalidatePath('/admin');
  revalidatePath('/news');
}