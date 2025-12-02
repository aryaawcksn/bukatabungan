import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Trash2, Edit, Plus, UserCog, ScrollText } from "lucide-react";
import { toast } from "sonner";
import type { Cabang } from "./CabangSetting";

interface User {
  id: number;
  username: string;
  role: "admin" | "employement";
  cabang_id: number;
  nama_cabang?: string;
}

interface AccountSettingProps {
  cabangList: Cabang[];
}

export default function AccountSetting({ cabangList }: AccountSettingProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [logLoading, setLogLoading] = useState(false);
  const [page, setPage] = useState(1);

  const LOG_LIMIT = 5;

  // Form State
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "employement",
    cabang_id: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://bukatabungan-production.up.railway.app/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        toast.error(data.message || "Gagal mengambil data user");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat mengambil data user");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (currentPage = 1) => {
  setLogLoading(true);
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `https://bukatabungan-production.up.railway.app/api/user-logs?page=${currentPage}&limit=${LOG_LIMIT}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      }
    );

    const data = await res.json();

    if (data.success) {
      setLogs(data.data);
    } else {
      toast.error(data.message || "Gagal mengambil log");
    }
  } catch (err) {
    console.error(err);
    toast.error("Gagal mengambil log user");
  } finally {
    setLogLoading(false);
  }
};


  const handleOpenDialog = (user?: User) => {
    const adminCabangId = localStorage.getItem("admin_cabang_id");
    
    if (user) {
      setIsEditing(true);
      setSelectedUser(user);
      setFormData({
        username: user.username,
        password: "", // Password kosong saat edit (opsional diubah)
        role: user.role,
        cabang_id: user.cabang_id.toString(),
      });
    } else {
      setIsEditing(false);
      setSelectedUser(null);
      setFormData({
        username: "",
        password: "",
        role: "employement",
        cabang_id: adminCabangId || "",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.username || !formData.role || !formData.cabang_id) {
      toast.error("Semua field wajib diisi");
      return;
    }

    if (!isEditing && !formData.password) {
      toast.error("Password wajib diisi untuk user baru");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const url = isEditing
        ? `https://bukatabungan-production.up.railway.app/api/auth/users/${selectedUser?.id}`
        : "https://bukatabungan-production.up.railway.app/api/auth/register";
      
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          cabang_id: parseInt(formData.cabang_id),
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(isEditing ? "User berhasil diupdate" : "User berhasil dibuat");
        setDialogOpen(false);
        fetchUsers();
      } else {
        toast.error(data.message || "Gagal menyimpan user");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat menyimpan user");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus user ini?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://bukatabungan-production.up.railway.app/api/auth/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        toast.success("User berhasil dihapus");
        fetchUsers();
      } else {
        toast.error(data.message || "Gagal menghapus user");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat menghapus user");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
    <UserCog className="w-5 h-5 text-indigo-600" />
    Daftar User
  </h3>

  <div className="flex gap-2">
    {/* ✅ BUTTON ICON LOG USER */}
    <Button
      variant="outline"
      size="icon"
      onClick={() => {
        setLogOpen(true);
        setPage(1);
        fetchLogs(1);
      }}
      className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
      title="Lihat Log Aktivitas"
    >
      <ScrollText className="w-4 h-4" />
    </Button>
    {/* ✅ BUTTON TAMBAH USER */}
    <Button
      onClick={() => handleOpenDialog()}
      className="bg-indigo-600 hover:bg-indigo-700 text-white"
    >
      <Plus className="w-4 h-4 mr-2" />
      Tambah User
    </Button>
  </div>
</div>


      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Cabang</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                  Memuat data user...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                  Belum ada user terdaftar.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role === 'admin' ? 'Administrator' : 'Staff Cabang'}
                    </span>
                  </TableCell>
                  <TableCell>{user.nama_cabang || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(user)}
                        className="h-8 w-8 text-slate-500 hover:text-indigo-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user.id)}
                        className="h-8 w-8 text-slate-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  <DialogContent className="w-full max-w-md">
    <DialogHeader>
      <DialogTitle>{isEditing ? "Edit User" : "Tambah User Baru"}</DialogTitle>
    </DialogHeader>

    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Username</label>
        <Input
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          placeholder="Masukkan username"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Password{" "}
          {isEditing && (
            <span className="text-slate-400 font-normal">
              (Kosongkan jika tidak ingin mengubah)
            </span>
          )}
        </label>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          placeholder="Masukkan password"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Role</label>
        <Select
          value={formData.role}
          onValueChange={(val) =>
            setFormData({ ...formData, role: val })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="employement">Staff Cabang</SelectItem>
            <SelectItem value="admin">Administrator</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Cabang</label>
        <Select
          value={formData.cabang_id}
          onValueChange={(val) =>
            setFormData({ ...formData, cabang_id: val })
          }
          disabled={!!localStorage.getItem("admin_cabang_id")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Cabang" />
          </SelectTrigger>
          <SelectContent>
            {cabangList.map((cabang) => (
              <SelectItem key={cabang.id} value={cabang.id.toString()}>
                {cabang.nama_cabang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    <DialogFooter className="flex justify-end gap-2">
      <Button variant="outline" onClick={() => setDialogOpen(false)}>
        Batal
      </Button>
      <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSubmit}>
        {isEditing ? "Simpan Perubahan" : "Buat User"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

<Dialog open={logOpen} onOpenChange={setLogOpen}>
  <DialogContent className="w-full max-w-4xl">
    <DialogHeader>
      <DialogTitle>Log Aktivitas User</DialogTitle>
    </DialogHeader>

    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>Waktu</TableHead>
            <TableHead>Tindakan</TableHead>
            <TableHead>Untuk User</TableHead>
            <TableHead>Dilakukan oleh</TableHead>
            <TableHead>IP</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {logLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-slate-500">
                Memuat log aktivitas...
              </TableCell>
            </TableRow>
          ) : logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-slate-500">
                Belum ada log aktivitas.
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {new Date(log.created_at).toLocaleString("id-ID")}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      log.action.includes("DELETE")
                        ? "bg-red-100 text-red-700"
                        : log.action.includes("UPDATE")
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {log.action}
                  </span>
                </TableCell>
                <TableCell>{log.target_username || "-"}</TableCell>
                <TableCell>{log.performed_by}</TableCell>
                <TableCell className="text-xs text-slate-500">
                  {log.ip_address}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>

    {/* ✅ PAGINATION */}
    <div className="flex justify-between items-center pt-4">
      <Button
        variant="outline"
        disabled={page === 1}
        onClick={() => {
          const newPage = page - 1;
          setPage(newPage);
          fetchLogs(newPage);
        }}
      >
        Prev
      </Button>

      <span className="text-sm text-slate-600">
        Halaman {page}
      </span>

      <Button
        variant="outline"
        disabled={logs.length < LOG_LIMIT}
        onClick={() => {
          const newPage = page + 1;
          setPage(newPage);
          fetchLogs(newPage);
        }}
      >
        Next
      </Button>
    </div>
  </DialogContent>
</Dialog>


    </div>
  );
}
