'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUpdateResource } from '@/hooks/useResourceApi';
import { Resource } from '@/types/api';

const resourceSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  type: z.string().min(1, 'El tipo es requerido'),
  category: z.string().min(1, 'La categoría es requerida'),
  format: z.string().min(1, 'El formato es requerido'),
  author: z.string().optional(),
  externalUrl: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  tags: z.string().optional(),
});

type ResourceFormData = z.infer<typeof resourceSchema>;

interface EditResourceDialogProps {
  resource: Resource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResourceUpdated?: () => void;
}

export function EditResourceDialog({ 
  resource, 
  open, 
  onOpenChange, 
  onResourceUpdated 
}: EditResourceDialogProps) {
  const { toast } = useToast();
  const { mutateAsync: updateResource, isPending } = useUpdateResource();

  const form = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: '',
      description: '',
      type: '',
      category: '',
      format: '',
      author: '',
      externalUrl: '',
      tags: '',
    },
  });

  // Update form when resource changes
  useEffect(() => {
    if (resource) {
      form.reset({
        title: resource.title,
        description: resource.description,
        type: resource.type,
        category: resource.category,
        format: resource.format,
        author: resource.author || '',
        externalUrl: resource.externalUrl || '',
        tags: resource.tags?.join(', ') || '',
      });
    }
  }, [resource, form]);

  const onSubmit = async (data: ResourceFormData) => {
    if (!resource) return;

    try {
      const updateData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
      };

      await updateResource({
        id: resource.id,
        data: updateData,
      });

      toast({
        title: 'Recurso actualizado',
        description: 'El recurso se ha actualizado exitosamente',
      });

      onOpenChange(false);
      onResourceUpdated?.();
    } catch (error) {
      console.error('Error updating resource:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el recurso. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Recurso</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título del recurso" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descripción detallada del recurso"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DOCUMENT">Documento</SelectItem>
                        <SelectItem value="VIDEO">Video</SelectItem>
                        <SelectItem value="AUDIO">Audio</SelectItem>
                        <SelectItem value="IMAGE">Imagen</SelectItem>
                        <SelectItem value="TEXT">Texto</SelectItem>
                        <SelectItem value="TEMPLATE">Plantilla</SelectItem>
                        <SelectItem value="TOOLKIT">Kit de Herramientas</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PROGRAMMING">Programación</SelectItem>
                        <SelectItem value="DESIGN">Diseño</SelectItem>
                        <SelectItem value="BUSINESS">Negocios</SelectItem>
                        <SelectItem value="EDUCATION">Educación</SelectItem>
                        <SelectItem value="HEALTH">Salud</SelectItem>
                        <SelectItem value="TECHNOLOGY">Tecnología</SelectItem>
                        <SelectItem value="ENTREPRENEURSHIP">Emprendimiento</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Formato</FormLabel>
                    <FormControl>
                      <Input placeholder="PDF, DOCX, MP4, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Autor</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del autor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="externalUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Externa</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://ejemplo.com/recurso.pdf"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etiquetas</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="etiqueta1, etiqueta2, etiqueta3"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Actualizando...' : 'Actualizar Recurso'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
