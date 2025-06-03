import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layouts/DashboardLayout";
import type { NextPageWithLayout } from "../_app";
import { useState, type ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { ProductCatalogCard } from "@/components/shared/product/ProductCatalogCard";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Form } from "@/components/ui/form";
import { CategoryForm } from "@/components/shared/category/CategoryForm";
import { ProductForm } from "@/components/shared/product/ProductForm";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productFormSchema, type ProductFormSchema } from "@/forms/produc";
import { api } from "@/utils/api";

const ProductsPage: NextPageWithLayout = () => {
  const [createProductDialogOpen, setCreateProductDialogOpen] = useState(false);
  const apiUtils = api.useUtils();

  const [uploadedCreateImageUrl, setUploadedCreateImageUrl] = useState<
    string | null
  >(null);

  const { data: products, isLoading: productIsLoading } =
    api.product.getProducts.useQuery();

  // create product

  const { mutate: createProduct } = api.product.createProducts.useMutation({
    onSuccess: async () => {
      await apiUtils.product.getProducts.invalidate();
      alert("successfuly create product");
      setCreateProductDialogOpen(false);
      createProductForm.reset();
    },
  });

  const createProductForm = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
  });

  const handleSubmitCreateProduct = (values: ProductFormSchema) => {
    if (!uploadedCreateImageUrl) {
      alert("Please upload a product image first");

      return;
    }
    createProduct({
      name: values.name,
      price: values.price,
      categoryId: values.categoryId,
      imageUrl: uploadedCreateImageUrl ?? "",
    });
  };

  return (
    <>
      <DashboardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <DashboardTitle>Product Management</DashboardTitle>
            <DashboardDescription>
              View, add, edit, and delete products in your inventory.
            </DashboardDescription>
          </div>
          <AlertDialog
            open={createProductDialogOpen}
            onOpenChange={setCreateProductDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button>Add New Product</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Add New Product</AlertDialogTitle>
              </AlertDialogHeader>
              <Form {...createProductForm}>
                <ProductForm
                  onSubmit={handleSubmitCreateProduct}
                  onChangeImageUrl={(imageUrl) => {
                    setUploadedCreateImageUrl(imageUrl);
                  }}
                />
              </Form>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  onClick={createProductForm.handleSubmit(
                    handleSubmitCreateProduct,
                  )}
                >
                  Create Product
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DashboardHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products?.map((product) => (
          <ProductCatalogCard
            key={product.id}
            name={product.name}
            price={product.price}
            image={product.imageUrl ?? ""}
            category={product.category.name}
          />
        ))}
      </div>
    </>
  );
};

ProductsPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default ProductsPage;
