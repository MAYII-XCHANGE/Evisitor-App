import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { adminService } from "../../services/adminService";
import { useAdminOptions } from "../../hooks/useAdminOptions";
import { getApiError } from "../../utils/apiResponse";
import { departmentRules } from "../../validation/adminValidation";

const defaults={name:"",branchId:""};
export const DepartmentFormModal=({isOpen,department,onClose})=>{const queryClient=useQueryClient();const options=useAdminOptions();const editing=Boolean(department);const{register,handleSubmit,reset,setError,formState:{errors}}=useForm({defaultValues:defaults});useEffect(()=>{reset(department?{name:department.name,branchId:department.branchId}:defaults);},[department,isOpen,reset]);const close=()=>{reset(defaults);onClose();};const mutation=useMutation({mutationFn:(payload)=>editing?adminService.updateDepartment({id:department.id,payload}):adminService.createDepartment(payload),onSuccess:()=>{queryClient.invalidateQueries({queryKey:["admin-departments"]});queryClient.invalidateQueries({queryKey:["admin-options","departments"]});toast.success(editing?"Department updated":"Department created");close();},onError:(error)=>setError("root",{message:getApiError(error).message})});const submit=(values)=>mutation.mutate({name:values.name.trim(),branchId:values.branchId});return <Modal isOpen={isOpen} title={editing?"Edit Department":"Create New Department"} description={editing?"Update the department name and branch assignment.":"A unique department code is generated automatically and the department starts as active."} onClose={close} footer={<><Button variant="secondary" onClick={close}>Cancel</Button><Button type="submit" form="department-form" disabled={mutation.isPending||options.isLoading}>{mutation.isPending?"Saving...":editing?"Save Changes":"Create Department"}</Button></>}><form id="department-form" className="space-y-4" onSubmit={handleSubmit(submit)}><Input label="Department name" error={errors.name?.message} {...register("name",departmentRules.name)}/><Select label="Branch" placeholder="Select branch" options={options.branchOptions} error={errors.branchId?.message} {...register("branchId",departmentRules.branchId)}/>{errors.root&&<p className="text-sm text-danger">{errors.root.message}</p>}</form></Modal>;};
